import { Module } from '@nestjs/common';
import { appLogger, PushNotifier } from './logger.service';

@Module({
  providers: [appLogger, PushNotifier],
  exports: [appLogger, PushNotifier],
})
export class LoggerModule {}
