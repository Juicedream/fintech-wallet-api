import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { Wallet } from './wallet.schema';

import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { TransferDto } from './dto/transfer.dto';
import { TransactionsService } from '../transactions/transactions.service';

const TOP_UP_LIMIT = 100000;
const WITHDRAWAL_LIMIT = 50000;

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectConnection() private readonly walletDbConnection: Connection,
    private readonly transactionsService: TransactionsService,
  ) {}

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
    const session = await this.walletDbConnection.startSession();
    session.startTransaction();
    try {
      const user = await this.walletModel.findOne({ userId }).session(session);
      if (!user) {
        // create wallet
        const newWallet = await this.walletModel.create(
          [
            {
              balance: 0,
              name: createWalletDto.name,
              userId: String(userId),
              walletNumber: await this.generateWalletNumber(),
            },
          ],
          { session },
        );

        await session.commitTransaction();

        return newWallet[0];
      } else {
        throw new BadRequestException('Wallet already exists for this user');
      }
    } catch {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Unable to create wallet for user, please try again',
      );
    } finally {
      await session.endSession();
    }
  }

  async topUp(userId: string, amount: number) {
    if (!amount) throw new UnauthorizedException('Amount is required');
    if (amount > TOP_UP_LIMIT)
      throw new BadRequestException(
        `Amount cannot be greater than $${TOP_UP_LIMIT}`,
      );
    const session = await this.walletDbConnection.startSession();
    session.startTransaction();
    try {
      const wallet = await this.walletModel
        .findOne({ userId })
        .session(session);
      if (!wallet) throw new NotFoundException('No wallet found for user');
      wallet.balance += amount;
      wallet.updatedAt = new Date();
      // Create Transaction
      const transaction =
        await this.transactionsService.saveTransferTransaction(
          userId,
          {
            payerId: userId,
            payeeId: userId,
            activity: 'CREDIT',
            type: 'TOPUP',
            amount,
            walletNumber: wallet.walletNumber,
            reason: `Topup ${amount}`,
            reference: `REF-${Math.floor(
              Math.random() * 9999999 + 1000000,
            ).toString()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session,
        );
      // Save to user's wallet to Database
      await wallet.save({ session });
      await session.commitTransaction();
      return {
        message: `Wallet topped up with $${amount}`,
        wallet,
        transaction,
      };
    } catch {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Something went wrong when topping up wallet',
      );
    } finally {
      session.endSession();
    }
  }

  async withdraw(userId: string, amount: number) {
    if (!amount) throw new BadRequestException('Amount is required');
    if (amount < 1) throw new BadRequestException('Amount cannot be negative');
    const session = await this.walletDbConnection.startSession();
    session.startTransaction();
    try {
      const wallet = await this.walletModel
        .findOne({ userId })
        .session(session);
      if (!wallet) throw new NotFoundException('No wallet found for this user');
      if (!wallet.balance)
        throw new BadRequestException('Insufficient funds, Kindly top up');
      if (amount > WITHDRAWAL_LIMIT)
        throw new BadRequestException(
          `You can't withdraw more than $${WITHDRAWAL_LIMIT} per transaction`,
        );
      if (amount > wallet.balance)
        throw new BadRequestException(
          `Amount cannot be greater than your balance: $${wallet.balance}`,
        );
      wallet.balance -= amount;
      wallet.updatedAt = new Date();

      // create transaction for user
      const transaction =
        await this.transactionsService.saveTransferTransaction(
          userId,
          {
            payerId: userId,
            payeeId: userId,
            activity: 'DEBIT',
            type: 'WITHDRAWAL',
            amount,
            walletNumber: wallet.walletNumber,
            reason: `Withdrawal ${amount}`,
            reference: `REF-${Math.floor(
              Math.random() * 9999999 + 1000000,
            ).toString()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session,
        );

      // Save user's wallet to database
      await wallet.save({ session });

      await session.commitTransaction();

      return {
        message: `$${amount} withdrawn successfully`,
        wallet,
        transaction,
      };
    } catch (err) {
      await session.abortTransaction();
      const errorMessage = String(err);
      if (errorMessage.includes('BadRequestException'))
        throw new BadRequestException(`Withdrawal failed - ${err}`);
      else if (errorMessage.includes('NotFoundException'))
        throw new NotFoundException(err);
      else
        throw new InternalServerErrorException(
          'Failed to withdraw at the moment - please try again',
        );
    } finally {
      session.endSession();
    }
  }

  async transfer(userId: string, transferDto: TransferDto) {
    const existingTransaction =
      await this.transactionsService.getTransactionByReference(
        userId,
        transferDto.reference,
      );

    if (existingTransaction) {
      return {
        message: 'Transaction already processed',
        transaction: existingTransaction,
      };
    }

    const session = await this.walletDbConnection.startSession();
    session.startTransaction();
    try {
      if (!transferDto.amount)
        throw new BadRequestException('Amount is required');
      if (transferDto.amount < 1)
        throw new BadRequestException('Amount cannot be negative');

      const payerWallet = await this.walletModel
        .findOne({ userId })
        .session(session);

      if (!payerWallet)
        throw new NotFoundException('Wallet not found for this user');

      const payeeWallet = await this.walletModel
        .findOne({
          walletNumber: transferDto.payeeWalletNumber,
        })
        .session(session);

      if (!payeeWallet)
        throw new NotFoundException(
          'No wallet found with this number: ' + transferDto.payeeWalletNumber,
        );

      if (!payerWallet.balance || transferDto.amount > payerWallet.balance)
        throw new BadRequestException('Insufficient funds, Kindly top up');

      if (transferDto.payeeWalletNumber === payerWallet.walletNumber) {
        throw new UnauthorizedException('You cannot transfer to yourself');
      }

      payerWallet.balance -= transferDto.amount;
      payeeWallet.balance += transferDto.amount;
      payerWallet.updatedAt = new Date();
      payeeWallet.updatedAt = new Date();

      // Create transaction for this request
      const payerTransaction =
        await this.transactionsService.saveTransferTransaction(
          userId,
          {
            type: 'TRANSFER',
            payerId: userId,
            payeeId: payeeWallet.userId,
            walletNumber: payerWallet.walletNumber,
            amount: transferDto.amount,
            reference: transferDto.reference,
            reason: transferDto.reason || `Debited ${transferDto.amount}`,
            activity: 'DEBIT',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session,
        );

      const payeeTransaction =
        await this.transactionsService.saveTransferTransaction(
          payeeWallet.userId,
          {
            type: 'TRANSFER',
            payerId: userId,
            payeeId: payeeWallet.userId,
            walletNumber: payeeWallet.walletNumber,
            amount: transferDto.amount,
            activity: 'CREDIT',
            reference: transferDto.reference,
            reason: transferDto.reason || `Credited ${transferDto.amount}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session,
        );

      await payerWallet.save({ session });
      await payeeWallet.save({ session });

      await session.commitTransaction();

      return {
        message: `$${transferDto.amount} successfully to wallet number: [${transferDto.payeeWalletNumber}]`,
        wallet: payerWallet,
        transactions: [payerTransaction, payeeTransaction],
      };
    } catch (err) {
      await session.abortTransaction();
      const errorMessage = String(err);
      if (errorMessage.includes('UnauthorizedException'))
        throw new UnauthorizedException(`Transfer failed - ${err}`);
      else if (errorMessage.includes('BadRequestException'))
        throw new BadRequestException(`Transfer failed - ${err}`);
      else if (errorMessage.includes('NotFoundException'))
        throw new NotFoundException(`Transfer failed - ${err}`);
      else
        throw new InternalServerErrorException(
          `Cannot transfer from wallet at the moment - please try again - ${err}`,
        );
    } finally {
      session.endSession();
    }
  }

  async showWalletInformation(walletId: string) {
    return await this.walletModel.findById(walletId).exec();
  }

  async checkBalance(userId: string) {
    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet) throw new NotFoundException('No wallet for this user');

    return { balance: wallet.balance };
  }
}
