import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { Transaction } from '../transactions/transaction.schema';
import { Wallet } from '../wallets/wallet.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
  ) {}

  async getAll(showPassword: boolean = true) {
    return showPassword
      ? await this.userModel.find().exec()
      : await this.userModel.find().select('-password').exec();
  }

  async getById(userId: string, showPassword: boolean = true) {
    return showPassword
      ? await this.userModel.findById(userId).exec()
      : await this.userModel.findById(userId).select('-password').exec();
  }

  async getByEmail(email: string, showPassword: boolean = true) {
    return showPassword
      ? await this.userModel.findOne({ email }).exec()
      : await this.userModel.findOne({ email }).select('-password').exec();
  }

  async create(createUserDto: CreateUserDto) {
    return await this.userModel.create({ ...createUserDto });
  }

  async update(userId: string, updateDto: any): Promise<User> {
    return await this.userModel.findByIdAndUpdate(userId, {
      ...updateDto,
      updatedAt: new Date(),
    });
  }

  async delete(userId: string) {
    await this.walletModel.findByIdAndDelete(userId);
    await this.transactionModel.deleteMany({ payerId: userId });
    await this.userModel.findByIdAndDelete(userId);
    return {
      message: 'User deleted successfully',
    };
  }
}
