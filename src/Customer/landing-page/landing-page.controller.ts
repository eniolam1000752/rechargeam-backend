import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  Res,
  NotAcceptableException,
} from '@nestjs/common';
import { LandingPageService } from './landing-page.service';
import { CreateLandingPageDto } from './dto/create-landing-page.dto';
import { json, Request, Response } from 'express';
import { validator } from 'src/lib/globals';
import { PlanType } from 'src/db/entities/DataPlansEntity';
import { Middleware, UseMiddleware } from 'src/lib/decorators/middleware';
import { AuthService } from 'src/auth/auth.service';
import { resolvePtr } from 'dns';

@Controller('/api/landingPage')
export class LandingPageController {
  constructor(
    private readonly landingPageService: LandingPageService,
    private readonly authService: AuthService,
  ) {}

  @Middleware
  async adminGuard(req, resp) {
    await this.authService.superAdminAuthorize(req, resp);
  }

  @Post('/updateDataPlan')
  @UseMiddleware('adminGuard')
  async updateDataPlans(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { planId, dataAmount } = req.body;

    const errorMsgs = validator([
      {
        name: 'plan id',
        value: planId,
        options: { required: true, isNumber: true },
      },
      {
        name: 'data amount',
        value: dataAmount,
        options: { required: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    await this.landingPageService.updateDataPlan(req.body);
    resp.json({ description: 'operation successful' });
  }

  @Post('/updateSliderData')
  @UseMiddleware('adminGuard')
  async updateSliderData(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { id, text } = req.body;

    const errorMsgs = validator([
      {
        name: 'id',
        value: id,
        options: { required: true, isNumber: true },
      },
      {
        name: 'slider text',
        value: text,
        options: { required: true, isString: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    await this.landingPageService.updateSliderData(req.body);
    resp.json({ description: 'operation successful' });
  }

  @Post('/addSliderData')
  @UseMiddleware('adminGuard')
  async addSliderData(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { text } = req.body;

    const errorMsgs = validator([
      {
        name: 'slider text',
        value: text,
        options: { required: true, isString: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    await this.landingPageService.addSliderData(req.body);
    resp.json({ description: 'operation successful' });
  }

  @Post('/addDataPlan')
  @UseMiddleware('adminGuard')
  async addDataPlan(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { dataAmount, mobileOperator, type } = req.body;

    const errorMsgs = validator([
      {
        name: 'Data Amount',
        value: dataAmount,
        options: { required: true, isString: true },
      },
      {
        name: 'Mobile operator',
        value: mobileOperator,
        options: { required: true, isString: true },
      },
      {
        name: 'Data plan type',
        value: type,
        options: { required: true, isString: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    await this.landingPageService.addDataPlan(req.body);
    resp.json({ description: 'operation successful' });
  }

  @Post('/removeSliderData')
  @UseMiddleware('adminGuard')
  async removeSliderData(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { id } = req.body;

    const errorMsgs = validator([
      {
        name: 'Id',
        value: id,
        options: { required: true, isNumber: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }
    await this.landingPageService.removeSlideData(req.body);
    resp.json({ description: 'operation successful', code: 0 });
  }

  @Post('/removeDataPlan')
  @UseMiddleware('adminGuard')
  async removeDataPlan(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { id } = req.body;

    const errorMsgs = validator([
      {
        name: 'Id',
        value: id,
        options: { required: true, isNumber: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }
    await this.landingPageService.removeDataPlan(req.body);
    resp.json({ description: 'operation successful', code: 0 });
  }

  @Get('/dataPlans/:type')
  async findDataPlans(@Param('type') type: PlanType) {
    const errorMsgs = validator([
      {
        name: 'customer type',
        value: type,
        options: { required: true, isString: true },
      },
    ]);

    if (errorMsgs) {
      throw new NotAcceptableException(null, errorMsgs?.[0].msg?.[0]);
    }

    const dataPlans = await this.landingPageService.findDataPlans(type);
    return { description: 'operation successful', dataPlans, code: 0 };
  }

  @Get('/sliderData')
  async findSliderData() {
    const sliderData = await this.landingPageService.findSliderData();
    return { description: 'operation successful', sliderData, code: 0 };
  }
}
