import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString({ message: 'Name is reuquired' })
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8)
  password: string;
}
