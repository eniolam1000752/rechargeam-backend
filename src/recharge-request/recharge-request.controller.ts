import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService, CustomerAuthService } from 'src/auth/auth.service';
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
  ) {}

  @Middleware
  async customerAuth(req, resp) {
    await this.custAuth.customerAuthorize(req);
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
    const { amount, debitOperation } = req.body;

    await this.requestService.sendRequest(customer, amount, debitOperation);

    resp.json({ description: 'Operation successful', code: 0 });
  }
}
