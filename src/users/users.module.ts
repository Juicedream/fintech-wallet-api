import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletsModule } from '../wallets/wallets.module';
const UserSchemaModule = MongooseModule.forFeature([
  {
    name: User.name,
    schema: UserSchema,
  },
]);
@Module({
  imports: [
    UserSchemaModule,
    WalletsModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '10m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UserSchemaModule, UsersService],
})
export class UsersModule {}
