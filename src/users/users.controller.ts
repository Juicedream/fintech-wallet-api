import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  get(@Query('email') email?: string) {
    if (email) {
      const user = this.usersService.findOne(email);
      if (!user)
        throw new NotFoundException(
          'No user with this email address:  ' + email,
        );
      return user;
    }
    return this.usersService.findAll();
  }
}
