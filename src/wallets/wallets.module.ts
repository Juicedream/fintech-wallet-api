import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Wallet.name,
        schema: WalletSchema,
      },
    ]),
  ],
  controllers: [WalletsController],
  exports: [
    MongooseModule.forFeature([
      {
        name: Wallet.name,
        schema: WalletSchema,
      },
    ]),
  ],
})
export class WalletsModule {}
