import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { from } from 'rxjs';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'src/db/entities/RequestsEntity';
import { LoggerModule } from 'src/logger/logger.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { config } from 'dotenv';

config();

const jwtConfig = JwtModule.register({
  secret: process.env.JWT_SECRETE,
  signOptions: { expiresIn: '604800s' },
});
@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, Devices]),
    jwtConfig,
  ],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
