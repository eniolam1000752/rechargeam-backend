import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, CustomerAuthService } from 'src/auth/auth.service';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Customer } from 'src/db/entities/CustomerEntity';
import { Status } from 'src/db/entities/RequestsEntity';
import { Middleware, UseMiddleware } from 'src/lib/decorators/middleware';
import { PushNotifier } from 'src/logger/logger.service';
import { ISendRequest, IGetReqQueryParam } from './recharge-request.dto';
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
      resp.json({ notificationResp });
    } catch (exp) {
      console.log('Exception => ', exp);
      resp.json({ exp });
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
    @Query() query: IGetReqQueryParam,
  ) {
    const admin = req.userData;
    const { type } = query;
    const requests = await this.requestService.getRequests(admin.userId, type);

    resp.json({ description: 'Operation successful', code: 0, requests });
  }

  @Get('customer/getTransactions')
  @UseMiddleware('customerAuth')
  async getTransactions(
    @Req() req: Request & { customerData: Customer },
    @Res() resp: Response,
    @Query() query: IGetReqQueryParam,
  ) {
    const customer = req.customerData;
    const transactions = await this.requestService.getTransacitons(customer);

    resp.json({
      description: 'Operation successful',
      code: 0,
      requests: transactions,
    });
  }

  @Post('admin/updateRequest')
  @UseMiddleware('adminAuth')
  async updateRequest(
    @Req() req: Request & { userData: any },
    @Res() resp: Response,
  ) {
    const { status, requestId, ref } = req.body;

    if (!status && !Status[status]) {
      throw new BadRequestException('status cannot be empty');
    }
    if (!requestId) {
      throw new BadRequestException('Request id cannot be empty');
    }
    await this.requestService.updateRequest(requestId, status, ref);

    resp.json({ description: 'Operation successful', code: 0 });
  }
}
