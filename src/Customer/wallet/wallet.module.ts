import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, CustomerAuthModule } from 'src/auth/auth.module';
import { DataPlans } from 'src/db/entities/DataPlansEntity';
import { SliderData } from 'src/db/entities/SliderDataEntity';
import { Wallet } from 'src/db/entities/Wallet';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), AuthModule, CustomerAuthModule],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
