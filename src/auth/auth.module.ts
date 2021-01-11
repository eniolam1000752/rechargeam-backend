import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { from } from 'rxjs';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'src/db/entities/RequestsEntity';
import { LoggerModule } from 'src/logger/logger.module';
import { AuthController, CustomerAuthController } from './auth.controller';
import { AuthService, CustomerAuthService } from './auth.service';
import { config } from 'dotenv';
import { Customer } from 'src/db/entities/CustomerEntity';

config();

const jwtConfig = JwtModule.register({
  secret: process.env.JWT_SECRETE,
  signOptions: { expiresIn: '604800s' },
});

const custJwtConfig = JwtModule.register({
  secret: process.env.JWT_SECRETE,
  signOptions: { expiresIn: '180s' },
});
@Module({
  imports: [TypeOrmModule.forFeature([AdminUser, Devices]), jwtConfig],
  exports: [TypeOrmModule, AuthService],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser, Devices, Customer]),
    custJwtConfig,
  ],
  exports: [TypeOrmModule, CustomerAuthService],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService],
})
export class CustomerAuthModule {}
