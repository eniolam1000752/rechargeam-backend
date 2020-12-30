import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger/logger.module';
import { PushNotifier } from 'src/logger/logger.service';
import { RechargeRequestController } from './recharge-request.controller';
import { RechargeRequest } from './recharge-request.service';

@Module({
  imports: [LoggerModule],
  providers: [RechargeRequest],
  controllers: [RechargeRequestController],
})
export class RechargeRequestModule {}
