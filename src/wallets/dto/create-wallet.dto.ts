import { IsNotEmpty, Length } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @Length(20)
  name: string;
}
