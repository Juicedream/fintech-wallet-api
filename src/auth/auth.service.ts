import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async create(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  async login(loginDto: LoginDto) {
    return this.usersService.loginUser(loginDto.email, loginDto.password);
  }
}
