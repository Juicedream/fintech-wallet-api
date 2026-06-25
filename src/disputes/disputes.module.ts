import { Module } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { Dispute, DisputeSchema } from './disputes.schema';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/transaction.schema';

const DisputeSchemaModule = MongooseModule.forFeature([
  {
    name: Dispute.name,
    schema: DisputeSchema,
  },
]);
const TransactionSchemaModule = MongooseModule.forFeature([
  {
    name: Transaction.name,
    schema: TransactionSchema,
  },
]);

@Module({
  imports: [DisputeSchemaModule, TransactionSchemaModule],
  providers: [DisputesService],
  controllers: [DisputesController],
})
export class DisputesModule {}
