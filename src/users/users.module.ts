import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { WalletsModule } from '../wallets/wallets.module';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/transaction.schema';
const UserSchemaModule = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);
const TransactionSchemaModule = MongooseModule.forFeature([
  {
    name: Transaction.name,
    schema: TransactionSchema,
  },
]);

@Module({
  imports: [UserSchemaModule, WalletsModule, TransactionSchemaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UserSchemaModule, UsersService],
})
export class UsersModule {}
