import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../roles/roles.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../roles/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard, RolesGuard)
  async get(@Query('email') email?: string) {
    if (email) {
      const user = await this.usersService.findOne(email);
      if (!user)
        throw new NotFoundException(
          'No user with this email address:  ' + email,
        );
      return user;
    }
    return this.usersService.findAll();
  }
}
