import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataPlans, PlanType } from 'src/db/entities/DataPlansEntity';
import { SliderData } from 'src/db/entities/SliderDataEntity';
import { MobileOperators } from 'src/lib/constants';
import { Repository } from 'typeorm';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';

@Injectable()
export class LandingPageService {
  constructor(
    @InjectRepository(DataPlans)
    private readonly dataPlansRepo: Repository<DataPlans>,
    @InjectRepository(SliderData)
    private readonly sliderDataRepo: Repository<SliderData>,
  ) {}

  async updateDataPlan(data) {
    const { planId, dataAmount } = data;

    const plan = await this.dataPlansRepo.findOne({
      where: { dataAmount, id: planId },
    });

    if (plan) {
      throw new NotAcceptableException(null, 'Data plan already exists');
    }

    try {
      await this.dataPlansRepo.save({ id: planId, dataAmount });

      return;
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  async findDataPlans(type: PlanType) {
    try {
      const dataPlans = await this.dataPlansRepo.find({
        where: { planType: type },
      });

      const output = dataPlans.reduce((cum, item) => {
        delete item.planType;
        cum[item.mobileOperator] = [...(cum[item.mobileOperator] || []), item];
        delete item.mobileOperator;
        return cum;
      }, {});

      return output;
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  async addDataPlan(data: {
    mobileOperator: MobileOperators;
    type: PlanType;
    dataAmount: string;
  }) {
    const { mobileOperator, type, dataAmount } = data;

    const plan = await this.dataPlansRepo.findOne({
      where: { dataAmount, mobileOperator, planType: type },
    });

    if (plan) {
      throw new NotAcceptableException(null, 'Data plan already exists');
    }

    try {
      const dataPlan = await this.dataPlansRepo.save({
        dataAmount,
        mobileOperator,
        planType: type,
      });

      return dataPlan;
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  async removeDataPlan(data: { id: number }) {
    try {
      const { id } = data;
      await this.dataPlansRepo.delete({ id });
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  async updateSliderData(data) {
    try {
      const { id, text } = data;
      await this.sliderDataRepo.save({ id, text, updatedDate: new Date() });
      return;
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }
  async addSliderData(data) {
    try {
      const { text } = data;
      const sliderData = await this.sliderDataRepo.save({
        text,
        updatedDate: new Date(),
        createdDate: new Date(),
      });
      console.log(sliderData);
      return sliderData;
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  async findSliderData() {
    try {
      const sliderData = await this.sliderDataRepo.find();
      return sliderData;
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  async removeSlideData(data: { id: number }) {
    try {
      const { id } = data;
      await this.sliderDataRepo.delete({ id });
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }
}
