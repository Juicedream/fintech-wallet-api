import {
  // Body,
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  // ValidationPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { HistoryDto } from './dtos/history.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ description: "Shows user's transaction history" })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'limit',
    example: 3,
    type: Number,
    required: false,
    description: 'Shows transactions by limit',
  })
  @ApiQuery({
    name: 'page',
    example: 1,
    type: Number,
    required: false,
    description: 'Shows transactions by page',
  })
  @ApiQuery({
    name: 'filter',
    example: 'ALL',
    type: String,
    required: false,
    description: 'Shows transactions by filters',
  })
  @Get('history')
  @UseGuards(AuthGuard)
  async history(@Request() req: any, @Query() queryHistoryDto?: HistoryDto) {
    return await this.transactionsService.showHistory(
      req?.user._id,
      queryHistoryDto.filter,
      Number(queryHistoryDto.page),
      Number(queryHistoryDto.limit),
    );
  }
}
