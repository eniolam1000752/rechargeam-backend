import {
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { RechargeRequestModule } from './recharge-request/recharge-request.module';
import { LoggerModule } from './logger/logger.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AdminUser } from './db/entities/AdminUserEntity';
import { Request } from './db/entities/RequestsEntity';
import { Customer } from './db/entities/CustomerEntity';
import { Devices } from './db/entities/DevicesEntity';
import { UserModule } from './users/users.module';

config();

const dbConfig: TypeOrmModuleOptions =
  process.env.NODE_ENV !== 'production'
    ? {
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [AdminUser, Request, Customer, Devices],
        synchronize: true,
        autoLoadEntities: true,
      }
    : {
        type: 'mysql',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [AdminUser, Request, Customer, Devices],
        synchronize: true,
        autoLoadEntities: true,
      };

// const jwtConfig = JwtModule.register({
//   secret: process.env.JWT_SECRETE,
//   signOptions: { expiresIn: '604800s' },
// });
@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig as TypeOrmModuleOptions),
    AuthModule,
    RechargeRequestModule,
    UserModule,
    LoggerModule,
    // jwtConfig,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(Authorize).forRoutes(UserController);
  // }
}
