import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DisputeStatusConstants } from '../../../constants/constants';

export class UpdateDisputeDto {
  @ApiProperty({ example: { message: 'Hello' } })
  comment: Message;

  @ApiProperty({ example: 'PENDING' })
  @IsNotEmpty()
  @IsEnum(DisputeStatusConstants)
  disputeStatus: string;
}

export interface Message {
  message: string;
  // date: Date;
}
