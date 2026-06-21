import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type WalletDocument = mongoose.HydratedDocument<Wallet>;

@Schema()
export class Wallet {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  balance: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
