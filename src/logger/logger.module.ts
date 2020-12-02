import { Module } from '@nestjs/common';
import { appLogger } from './logger.service';

@Module({
  providers: [appLogger],
  exports: [appLogger],
})
export class LoggerModule {}
