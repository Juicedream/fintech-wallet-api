import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { comparePasswords, hashPassword } from '../../utils';

import { WalletsService } from '../wallets/wallets.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private walletService: WalletsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private showUser(user: any) {
    return {
      id: String(user?._id),
      email: user.email,
      name: user.name,
      role: user.role,
      wallet: user.wallet ?? 'Shown below',
      isVerified: user.isVerified,
      transactions: user.transactions ?? [],
    };
  }

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.usersService.getByEmail(
      createUserDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }
    // hash password
    const hashedPassword = await hashPassword(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const newWallet = await this.walletService.create(
      newUser?._id as unknown as string,
      {
        name: `${createUserDto.name.split(' ')[0]}'s Wallet`,
      },
    );

    const updateUser = await this.usersService.update(String(newUser._id), {
      wallet: String(newWallet._id),
    });

    return {
      message: 'Kindly login with the credentials',
      user: this.showUser(updateUser),
      wallet: newWallet,
    };
  }

  async login(loginDto: LoginDto) {
    // check email
    const user = await this.usersService.getByEmail(loginDto.email);
    if (!user) throw new BadRequestException('Invalid Credentials');

    // compare password if user is found
    const passwordMatch = await comparePasswords(
      loginDto.password,
      user.password,
    );
    if (!passwordMatch) throw new BadRequestException('Invalid credentials');

    const payload: { sub: string; email: string; role: string } = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };
    // create jwt token
    const accessToken = await this.createAccessToken(payload);
    return {
      message: 'Login sucessful',
      accessToken,
      user: this.showUser(user),
    };
  }

  private async createAccessToken(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<string | undefined> {
    const token = await this.jwtService.signAsync(payload);

    return token;
  }

  async me(userId: string) {
    const user = await this.usersService.getById(userId);
    if (!user) throw new NotFoundException('User with this id not found');
    return this.showUser(user);
  }
}
