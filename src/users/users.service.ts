import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { comparePasswords, hashPassword } from '../../utils';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().select('-password').exec();
  }

  async findOne(email: string): Promise<User | undefined> {
    if (!email) throw new BadRequestException('Email is required');
    const user = await this.userModel.findOne({ email }).exec();
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
    await newUser.save();
    return newUser;
  }

  async loginUser(email: string, password: string) {
    //find user via email
    const user = await this.findOne(email);
    if (!user) throw new BadRequestException('Invalid credentials');
    // compare passwords
    const passwordsMatch = await comparePasswords(password, user.password);
    if (!passwordsMatch) throw new BadRequestException('Invalid credentials');
    // return the user
    return { message: 'Logged in successfully', user };
  }
}
