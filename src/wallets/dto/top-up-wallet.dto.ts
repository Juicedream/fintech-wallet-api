import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TopUpWalletDto {
  @ApiProperty({ example: 8000 })
  @IsNumber()
  amount: number;
}
