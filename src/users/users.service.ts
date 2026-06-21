import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { comparePasswords, hashPassword } from '../../utils';
import { JwtService } from '@nestjs/jwt';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private walletService: WalletsService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().select('-password').exec();
  }

  async findOne(email: string): Promise<User | undefined> {
    if (!email) throw new BadRequestException('Email is required');
    const user = await this.userModel.findOne({ email }).exec();
    return user;
  }

  async getUserProfile(userId: string): Promise<User | undefined> {
    if (!userId) throw new BadRequestException('User Id is missing');
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate('wallet');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    // find if user already exists with the email
    const existingUser = await this.findOne(createUserDto.email);
    if (existingUser) throw new BadRequestException('Email already exists');
    // hash the password
    const hashedPassword = await hashPassword(createUserDto.password);
    // create the new user
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // create wallet service
    const newWallet = await this.walletService.createWallet(
      String(newUser._id),
      { name: `${newUser.name.split(' ')[0]}'s Wallet` },
    );
    newUser.wallet = String(newWallet._id);
    await newUser.save();
    return { message: 'Kindly login with the credentials', user: newUser };
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ message: string; user: User; access_token: string }> {
    //find user via email
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new BadRequestException('Invalid credentials');
    // compare passwords
    const passwordsMatch = await comparePasswords(password, user.password);
    if (!passwordsMatch) throw new BadRequestException('Invalid credentials');
    // create the jwt payload
    const payload = {
      sub: user?._id,
      name: user.name,
      role: user.role,
    };
    // return the user
    return {
      message: 'Logged in successfully',
      user,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
