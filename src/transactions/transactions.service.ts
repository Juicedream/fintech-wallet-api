import { Injectable } from '@nestjs/common';
import { ClientSession, Model } from 'mongoose';
// import { Transaction } from './transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/user.schema';
import { Transaction } from './transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionsModel: Model<Transaction>,
    @InjectModel(User.name) private usersModel: Model<User>,
  ) {}

  async getTransactionByReference(payerId: string, reference: string) {
    const transaction = await this.transactionsModel.findOne({
      payerId,
      reference,
    });
    return transaction;
  }

  async saveTransferTransaction(
    userId: string,
    transaction: Transaction,
    session: ClientSession,
  ) {
    const newTransaction = await this.transactionsModel.create([transaction], {
      session,
    });

    // Update the payer's transactions array
    const user = await this.usersModel.findById(userId).session(session);
    user.transactions.push(newTransaction[0]);
    await user.save({ session });

    // return the saved transaction
    return newTransaction[0];
  }

  async showForCurrentUser(transactionArray: string[]) {
    if (transactionArray.length < 1) return [];
    const transactions = await Promise.all([
      ...transactionArray.map(
        async (num) => await this.showTransactionById(num),
      ),
    ]);
    return transactions;
  }

  async showTransactionById(transactionId: string) {
    return await this.transactionsModel.findById(String(transactionId));
  }
}
