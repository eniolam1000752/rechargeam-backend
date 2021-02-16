import {
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthController } from './auth/auth.controller';
import { AuthModule, CustomerAuthModule } from './auth/auth.module';
import { RechargeRequestModule } from './Customer/recharge-request/recharge-request.module';
import { LoggerModule } from './logger/logger.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { AdminUser } from './db/entities/AdminUserEntity';
import { Request } from './db/entities/RequestsEntity';
import { Customer } from './db/entities/CustomerEntity';
import { Devices } from './db/entities/DevicesEntity';
import { UserModule } from './Admin/users/users.module';
import { Setting } from './db/entities/SettingsEntity';
import { SimCard } from './db/entities/SimcardsEntity';
import { UssdSchema } from './db/entities/UssdSchemaEntity';
import { CustomerPhoneNumbers } from './db/entities/CustomerPhoneNumbersEntity';
import { WalletModule } from './Customer/wallet/wallet.module';
import { LandingPageModule } from './Customer/landing-page/landing-page.module';
import { BlogModule } from './Customer/blog/blog.module';
import { DataPlans } from './db/entities/DataPlansEntity';
import { SliderData } from './db/entities/SliderDataEntity';

config();

const dbConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    AdminUser,
    Request,
    Customer,
    Devices,
    Setting,
    SimCard,
    UssdSchema,
    CustomerPhoneNumbers,
    DataPlans,
    SliderData,
  ],
  synchronize: true,
  autoLoadEntities: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig as TypeOrmModuleOptions),
    AuthModule,
    CustomerAuthModule,
    RechargeRequestModule,
    UserModule,
    LoggerModule,
    WalletModule,
    LandingPageModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}
