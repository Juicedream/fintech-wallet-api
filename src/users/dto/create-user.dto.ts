import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { RolesEnum } from '../user.schema';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString({ message: 'Name is reuquired' })
  @Length(3, 20)
  @ApiProperty({
    maximum: 20,
    minimum: 3,
    default: 'James Anima',
  })
  name: string;

  @IsEmail()
  @ApiProperty({
    default: 'james@anime.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 15)
  @ApiProperty({
    minimum: 8,
    maximum: 8,
    default: 'thisIsAtes',
  })
  password: string;

  @IsEnum(RolesEnum)
  @IsOptional()
  @ApiProperty({
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role?: string;
}
