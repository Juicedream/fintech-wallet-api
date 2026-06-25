import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty({ example: { message: 'Hi' } })
  comment: Message;

  @ApiProperty({ example: 'Fraud' })
  @IsNotEmpty()
  @MinLength(3)
  disputeType: string;

  @ApiProperty({ example: '489dsfjs-ol04820' })
  @IsNotEmpty()
  @MinLength(5)
  transactionRefNumber: string;
}

export interface Message {
  message: string;
  // date: Date;
}
