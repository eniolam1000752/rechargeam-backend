import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, CustomerAuthService } from 'src/auth/auth.service';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Status } from 'src/db/entities/RequestsEntity';
import { Middleware, UseMiddleware } from 'src/lib/decorators/middleware';
import { PushNotifier } from 'src/logger/logger.service';
import { ISendRequest } from './recharge-request.dto';
import { RechargeRequestService } from './recharge-request.service';

@Controller('api/request')
export class RechargeRequestController {
  constructor(
    private readonly notify: PushNotifier,
    private readonly custAuth: CustomerAuthService,
    private readonly requestService: RechargeRequestService,
    private readonly authService: AuthService,
  ) {}

  @Middleware
  async customerAuth(req, resp) {
    await this.custAuth.customerAuthorize(req);
  }
  @Middleware
  async adminAuth(req, resp) {
    await this.authService.authorize(req, resp);
  }

  @Post('/testPush')
  async testPushRequest(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: any,
  ) {
    const { data, token, notification } = body;
    try {
      const notificationResp = await this.notify.push(
        token,
        data,
        notification,
      );
      console.log(notificationResp);
    } catch (exp) {
      console.log('Exception => ', exp);
    }
  }

  @Post('/sendRequest')
  @UseMiddleware('customerAuth')
  async sendRequest(
    @Req() req: Request<null, null, ISendRequest> & { customerData: any },
    @Res() resp: Response,
  ) {
    const customer = req.customerData;
    const { amount, debitOperation, phoneNumber, processor } = req.body;

    await this.requestService.sendRequest(
      customer,
      amount,
      debitOperation,
      phoneNumber,
      processor,
    );

    resp.json({ description: 'Operation successful', code: 0 });
  }

  @Get('admin/getRequests')
  @UseMiddleware('adminAuth')
  async getRequests(
    @Req() req: Request & { userData: any },
    @Res() resp: Response,
  ) {
    const admin = req.userData;
    const requests = await this.requestService.getRequests(admin.userId);

    resp.json({ description: 'Operation successful', code: 0, requests });
  }

  @Post('admin/updateRequest')
  @UseMiddleware('adminAuth')
  async updateRequest(
    @Req() req: Request & { userData: any },
    @Res() resp: Response,
  ) {
    const { status, requestId } = req.body;

    if (!status && !Status[status]) {
      throw new BadRequestException('status cannot be empty');
    }
    if (!requestId) {
      throw new BadRequestException('Request id cannot be empty');
    }
    await this.requestService.updateRequest(requestId, status);

    resp.json({ description: 'Operation successful', code: 0 });
  }
}
