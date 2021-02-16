import { Module } from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { LandingPageController } from './landing-page.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataPlans } from 'src/db/entities/DataPlansEntity';
import { AuthModule } from 'src/auth/auth.module';
import { SliderData } from 'src/db/entities/SliderDataEntity';

@Module({
  imports: [TypeOrmModule.forFeature([DataPlans, SliderData]), AuthModule],
  controllers: [LandingPageController],
  providers: [LandingPageService],
})
export class LandingPageModule {}
