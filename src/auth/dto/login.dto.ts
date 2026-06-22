import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    default: 'james@anime.com',
  })
  email: string;

  @IsNotEmpty()
  @Length(4)
  @ApiProperty({
    minimum: 4,
    default: 'thisIsAtes',
  })
  password: string;
}
