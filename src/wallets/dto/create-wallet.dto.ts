import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @Length(20)
  @ApiProperty({
    maximum: 20,
    default: 'James Wallet',
  })
  name: string;
}
