import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type TransactionDocument = mongoose.HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({ required: true })
  type: transactionType;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  payerId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  payeeId: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  reason: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: Date.now() })
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

enum transactionType {
  TRANSFER,
  WITHDRAWAL,
  TOPUP,
}
