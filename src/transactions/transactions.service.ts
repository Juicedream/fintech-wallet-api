import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientSession, Model } from 'mongoose';
// import { Transaction } from './transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/user.schema';
import { Transaction } from './transaction.schema';
import { Wallet } from '../wallets/wallet.schema';
import { FilterTypesConstants } from '../../constants/constants';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionsModel: Model<Transaction>,
    @InjectModel(User.name) private usersModel: Model<User>,
    @InjectModel(Wallet.name) private walletsModel: Model<Wallet>,
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
      ...transactionArray
        .reverse()
        .slice(0, 3)
        .map(async (num) => await this.showTransactionById(num)),
    ]);
    return transactions;
  }

  async showTransactionById(transactionId: string) {
    return await this.transactionsModel.findById(String(transactionId)).exec();
  }

  async showHistory(
    userId: string,
    filter: string,
    page: number = 1,
    limit: number = 3,
  ) {
    console.log({ userId, page, filter, limit });
    if (!page || page < 1 || (!limit && page > 1))
      throw new BadRequestException('Page is invalid and must start with 1');
    if (!filter) throw new BadRequestException('Filter is required');
    if (filter && !FilterTypesConstants.includes(filter.toUpperCase()))
      throw new BadRequestException(
        `Invalid filter (${filter}) - Filter must be one of these: ${FilterTypesConstants.join(', ')}`,
      );
    const { walletNumber } = await this.walletsModel.findOne({ userId });
    const transactions = await this.transactionsModel
      .find()
      .where('walletNumber')
      .equals(walletNumber)
      .sort({ createdAt: -1 })
      .exec();
    const activityFilter = filter.toUpperCase();
    let filteredTransactions =
      activityFilter === 'ALL'
        ? transactions
        : activityFilter === 'DEBIT' || activityFilter === 'CREDIT'
          ? transactions.filter(
              (transaction) => activityFilter === transaction.activity,
            )
          : transactions.filter(
              (transaction) => activityFilter === transaction.type,
            );
    // checks and validations
    const allTransactions = filteredTransactions.length;
    const pages = Math.round(filteredTransactions.length / limit);
    const nextPage = pages > 1 && page < pages ? page + 1 : null;
    const previousPage = page > 1 && pages > 1 ? page - 1 : null;
    const pageFormat =
      page === 1 ? 0 : limit === 1 ? page - 1 : page * (limit - 1);
    const limitFormat =
      page === 1 ? limit : limit === 1 ? limit * page : limit * 2;

    if (page > pages)
      throw new BadRequestException('Invalid page, Page not found');

    // filtering transactions
    filteredTransactions =
      isNaN(limit) || isNaN(page)
        ? filteredTransactions
        : filteredTransactions.slice(pageFormat, limitFormat);

    return {
      limit,
      pages,
      previousPage,
      currentPage: page,
      nextPage,
      totalTransactions: allTransactions,
      filter: activityFilter,
      transactions: filteredTransactions,
    };
  }
}
