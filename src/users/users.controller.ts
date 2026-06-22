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
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Shows all users or a specific user by email' })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Filter by email address to return a specific user',
  })
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard, RolesGuard)
  async get(@Query('email') email?: string) {
    if (email) {
      const user = await this.usersService.getByEmail(email);
      if (!user)
        throw new NotFoundException(
          'No user with this email address: ' + email,
        );
      return user;
    }
    return this.usersService.getAll();
  }
}
