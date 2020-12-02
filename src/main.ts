import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appLogger } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(appLogger));

  await app.listen(3500);
}
bootstrap();
