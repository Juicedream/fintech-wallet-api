import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { Throttle } from '@nestjs/throttler';
import {
  ApiResponse,
  ApiTooManyRequestsResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Creates user with wallet' })
  @ApiResponse({
    status: 201,
    description: 'Create successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Error occurred because of missing parameters',
  })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // after 1 minute you try again
  @Post('/create')
  async createNewUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Log in an existing user and returns an access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // after 1 minute you try again
  @Post('/login')
  async loginUser(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Shows current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User Profile fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.me(req.user._id);
  }
}
