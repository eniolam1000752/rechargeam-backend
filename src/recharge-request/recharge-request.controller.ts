import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PushNotifier } from 'src/logger/logger.service';

@Controller('api/request')
export class RechargeRequestController {
  constructor(private readonly notify: PushNotifier) {}

  @Post('/testPush')
  async testPushRequest(
    @Req() req: Request,
    @Res() resp: Response,
    @Body() body: any,
  ) {
    const { data, token, notification } = body;
    // console.log(body);
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
}
