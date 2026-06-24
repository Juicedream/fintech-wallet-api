import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transaction.schema';
import { TransactionsService } from './transactions.service';
import { User, UserSchema } from '../users/user.schema';
import { Wallet, WalletSchema } from '../wallets/wallet.schema';
const TransactionSchemaModule = MongooseModule.forFeature([
  {
    name: Transaction.name,
    schema: TransactionSchema,
  },
]);
const UserSchemaModule = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);
const WalletSchemaModule = MongooseModule.forFeature([
  {
    name: Wallet.name,
    schema: WalletSchema,
  },
]);

@Module({
  imports: [TransactionSchemaModule, UserSchemaModule, WalletSchemaModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionSchemaModule, TransactionsService],
})
export class TransactionsModule {}
