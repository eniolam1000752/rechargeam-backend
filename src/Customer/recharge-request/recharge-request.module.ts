import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, CustomerAuthModule } from 'src/auth/auth.module';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'src/db/entities/RequestsEntity';
import { LoggerModule } from 'src/logger/logger.module';
import { RechargeRequestController } from './recharge-request.controller';
import { RechargeRequestService } from './recharge-request.service';
import { config } from 'dotenv';
import { JwtModule } from '@nestjs/jwt';

config();

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([Request, AdminUser, Devices]),
    CustomerAuthModule,
    AuthModule,
  ],
  providers: [RechargeRequestService],
  exports: [],
  controllers: [RechargeRequestController],
})
export class RechargeRequestModule {}
