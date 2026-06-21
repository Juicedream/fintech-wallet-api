import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Wallet } from './wallet.schema';

import { InjectModel } from '@nestjs/mongoose';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(@InjectModel(Wallet.name) private walletModel: Model<Wallet>) {}

  async createWallet(userId: string, createWalletDto: CreateWalletDto) {
    console.log('Creating wallet for user');
    const user = await this.walletModel.findOne({ userId });
    if (!user) {
      // create wallet
      const newWallet = await this.walletModel.create({
        balance: 0,
        name: createWalletDto.name,
        userId: String(userId),
      });

      return newWallet;
    } else {
      throw new BadRequestException('Wallet already exists for this user');
    }
  }
}
