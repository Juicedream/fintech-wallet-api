import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type DisputeDocument = mongoose.HydratedDocument<Dispute>;

@Schema({ _id: false })
export class Message {
  @Prop({ required: true, type: String, minLength: 3, maxLength: 100 })
  message: string;

  @Prop({ default: Date.now, type: Date })
  date?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema()
export class Dispute {
  @Prop({ required: true })
  transactionRefNumber: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  disputeType: string;

  @Prop({ type: [MessageSchema] })
  messages: Message[];

  @Prop({ type: [MessageSchema] })
  adminComments: Message[];

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);
