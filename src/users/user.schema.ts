import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Transaction } from '../transactions/transaction.schema';
import { Wallet } from '../wallets/wallet.schema';

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' })
  wallet: Wallet;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' })
  transactions: Transaction[];

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: Date.now() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
