import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './transaction.schema';
import { TransactionsService } from './transactions.service';
import { User, UserSchema } from '../users/user.schema';
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

@Module({
  imports: [TransactionSchemaModule, UserSchemaModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionSchemaModule, TransactionsService],
})
export class TransactionsModule {}
