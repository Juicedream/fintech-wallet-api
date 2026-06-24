import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class TransferDto {
  @ApiProperty({ example: 8000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '112900' })
  @IsNotEmpty()
  payeeWalletNumber: string;

  @ApiProperty({ example: 'Transfer to faruq' })
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: 'a364djsdh482-dkadja7349' })
  @IsNotEmpty()
  reference: string;
}
