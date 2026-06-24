import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { WithdrawFromWalletDto } from './dto/withdraw-from-wallet.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @ApiOperation({ summary: 'Top up wallet' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('top-up')
  async topUp(
    @Request() req: any,
    @Body(ValidationPipe) topUpWalletDto: TopUpWalletDto,
  ) {
    return this.walletsService.topUp(req.user._id, topUpWalletDto.amount);
  }

  @ApiOperation({ summary: 'Transfer to another wallet' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('transfer')
  async transfer(
    @Request() req: any,
    @Body(ValidationPipe) transferDto: TransferDto,
  ) {
    return this.walletsService.transfer(req.user._id, transferDto);
  }

  @ApiOperation({ summary: 'Withdraw from wallet' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiCreatedResponse({ description: 'Withdrawal successful' })
  @Post('withdrawal')
  async withdraw(
    @Request() req: any,
    @Body(ValidationPipe) withdrawFromWallet: WithdrawFromWalletDto,
  ) {
    return this.walletsService.withdraw(
      req.user._id,
      withdrawFromWallet.amount,
    );
  }

  @ApiOperation({ summary: 'Check wallet balance' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('check-balance')
  async checkBalance(@Request() req) {
    return this.walletsService.checkBalance(req.user._id);
  }
}
