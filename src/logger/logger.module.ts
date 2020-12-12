import { Module } from '@nestjs/common';
import { appLogger, EmailSender } from './logger.service';

@Module({
  providers: [appLogger, EmailSender],
  exports: [appLogger, EmailSender],
})
export class LoggerModule {}
