import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Roles } from '../user.schema';

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

  @IsEnum(Roles)
  @IsOptional()
  role?: string;
}
