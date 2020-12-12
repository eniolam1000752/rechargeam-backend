import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appLogger } from './logger/logger.service';
import 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(appLogger));
  (global as typeof global & { app: any }).app = app;

  await app.listen(process.env.NODE_ENV !== 'production' ? 3500 : proces);
}
bootstrap();
