import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './wallet.schema';
import { WalletsService } from './wallets.service';
import { TransactionsModule } from '../transactions/transactions.module';
const WalletSchemaModule = MongooseModule.forFeature([
  {
    name: Wallet.name,
    schema: WalletSchema,
  },
]);
@Module({
  imports: [WalletSchemaModule, TransactionsModule],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletSchemaModule, WalletsService],
})
export class WalletsModule {}
