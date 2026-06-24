import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
export class WithdrawFromWalletDto {
  @ApiProperty({ example: 9000 })
  @IsNumber()
  amount: number;
}
