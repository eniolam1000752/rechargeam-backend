import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, CustomerAuthModule } from 'src/auth/auth.module';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'src/db/entities/RequestsEntity';
import { LoggerModule } from 'src/logger/logger.module';
import { PushNotifier } from 'src/logger/logger.service';
import { RechargeRequestController } from './recharge-request.controller';
import { RechargeRequestService } from './recharge-request.service';

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([Request, AdminUser, Devices]),
    CustomerAuthModule,
  ],
  providers: [RechargeRequestService],
  exports: [],
  controllers: [RechargeRequestController],
})
export class RechargeRequestModule {}
