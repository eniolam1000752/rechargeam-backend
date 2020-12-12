import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { from } from 'rxjs';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'src/db/entities/RequestsEntity';
import { LoggerModule } from 'src/logger/logger.module';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { config } from 'dotenv';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthController } from 'src/auth/auth.controller';

config();

const jwtConfig = JwtModule.register({
  secret: process.env.JWT_SECRETE,
  signOptions: { expiresIn: '604800s' },
});

@Module({
  imports: [
    AuthModule,
    jwtConfig,
    // TypeOrmModule.forFeature([AdminUser, Devices]),
  ],
  // exports: [],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService],
})
export class UserModule {}
