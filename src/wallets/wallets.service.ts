import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Wallet } from './wallet.schema';

import { InjectModel } from '@nestjs/mongoose';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { TransferDto } from './dto/transfer.dto';

const TOP_UP_LIMIT = 100000;

@Injectable()
export class WalletsService {
  constructor(@InjectModel(Wallet.name) private walletModel: Model<Wallet>) {}

  private async generateWalletNumber(): Promise<string> {
    let sixDigits = String(Math.floor(Math.random() * 999999) + 100000);
    let wallets = await this.walletModel.find();
    let exists = true;
    while (exists) {
      const found = wallets.find((wallet) => wallet.walletNumber === sixDigits);
      if (found) {
        sixDigits = String(Math.floor(Math.random() * 999999) + 100000);
        wallets = await this.walletModel.find();
        exists = true;
        continue;
      } else {
        exists = false;
        break;
      }
    }
    return sixDigits;
  }

  async create(userId: string, createWalletDto: CreateWalletDto) {
    const user = await this.walletModel.findOne({ userId });
    if (!user) {
      // create wallet
      const newWallet = await this.walletModel.create({
        balance: 0,
        name: createWalletDto.name,
        userId: String(userId),
        walletNumber: await this.generateWalletNumber(),
      });

      return newWallet;
    } else {
      throw new BadRequestException('Wallet already exists for this user');
    }
  }

  async topUp(userId: string, amount: number) {
    if (!amount) throw new UnauthorizedException('Amount is required');
    if (amount > TOP_UP_LIMIT)
      throw new BadRequestException(
        `Amount cannot be greater than $${TOP_UP_LIMIT}`,
      );

    try {
      const wallet = await this.walletModel.findOne({ userId });
      if (!wallet) throw new NotFoundException('No wallet found for user');
      wallet.balance += amount;
      wallet.updatedAt = new Date();
      await wallet.save();
      return {
        message: `Wallet topped up with $${amount}`,
        wallet,
      };
    } catch {
      throw new InternalServerErrorException(
        'Something went wrong when topping up wallet',
      );
    }
  }

  async withdraw(userId: string, amount: number) {
    const wallet = await this.walletModel.findOne({ userId });
    if (!amount) throw new BadRequestException('Amount is required');
    if (!wallet) throw new NotFoundException('No wallet found for this user');
    if (!wallet.balance)
      throw new BadRequestException('Insufficient funds, Kindly top up');
    if (amount < 1) throw new BadRequestException('Amount cannot be negative');
    if (amount > wallet.balance)
      throw new BadRequestException(
        `Amount cannot be greater than your balance: $${wallet.balance}`,
      );
    wallet.balance -= amount;
    wallet.updatedAt = new Date();
    await wallet.save();

    return {
      message: `$${amount} withdrawn successfully`,
      wallet,
    };
  }

  async transfer(userId: string, transferDto: TransferDto) {
    if (!transferDto.amount)
      throw new BadRequestException('Amount is required');
    if (transferDto.amount < 1)
      throw new BadRequestException(
        'Transfer failed - Amount cannot be negative',
      );

    const payerWallet = await this.walletModel.findOne({ userId });

    if (!payerWallet)
      throw new NotFoundException('Wallet not found for this user');

    const payeeWallet = await this.walletModel.findOne({
      walletNumber: transferDto.payeeWalletNumber,
    });

    if (!payeeWallet)
      throw new NotFoundException(
        'No wallet found with this number: ' + transferDto.payeeWalletNumber,
      );

    if (!payerWallet.balance || transferDto.amount > payerWallet.balance)
      throw new BadRequestException(
        'Transfer failed - Insufficient funds, Kindly top up',
      );

    if (transferDto.payeeWalletNumber === payerWallet.walletNumber) {
      throw new UnauthorizedException(
        'Transfer failed - You cannot transfer to yourself',
      );
    }

    payerWallet.balance -= transferDto.amount;
    payeeWallet.balance += transferDto.amount;
    payerWallet.updatedAt = new Date();
    payeeWallet.updatedAt = new Date();

    await payerWallet.save();
    await payeeWallet.save();

    return {
      message: `$${transferDto.amount} successfully to wallet number: [${transferDto.payeeWalletNumber}]`,
      wallet: payerWallet,
    };
  }

  async checkBalance(userId: string) {
    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet) throw new NotFoundException('No wallet for this user');

    return { balance: wallet.balance };
  }
}
