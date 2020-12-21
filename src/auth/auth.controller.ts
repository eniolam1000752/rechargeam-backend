import {
  BadRequestException,
  Body,
  Controller,
  Header,
  InternalServerErrorException,
  Next,
  NotAcceptableException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import 'reflect-metadata';
import { AddAdminDto, PinLoginRequest } from './auth.dto';
import { sendMail } from '../lib/mailer';
import { config } from 'dotenv';
import { adminClass } from 'src/db/entities/AdminUserEntity';
import { Middleware, UseMiddleware } from 'src/lib/decorators/middleware';
import { emailRegex } from 'src/lib/constants';

config();
@Controller('/api/admin')
class AuthController {
  private readonly emailRegex: RegExp;

  constructor(private authService: AuthService) {}

  @Middleware
  async protection(req, resp) {
    await this.authService.authorize(req, resp);
  }

  @Middleware
  async superAdminProtection(req, resp) {
    await this.authService.superAdminAuthorize(req, resp);
  }
  @Middleware
  async allowRoute(req: Request & { allow: boolean }, resp) {
    const { super_admin_key } = req.headers;
    const { type } = req.body;

    req.allow =
      type === adminClass.SUPER &&
      super_admin_key === process.env.SUPER_ADMIN_KEY;
  }

  @Post('/pinLogin')
  async pinLogin(
    @Req() req: Request,
    @Body() body: PinLoginRequest,
    @Res({ passthrough: true }) resp: Response,
  ) {
    let { pin, deviceId, username } = body;
    username = username?.toLowerCase();

    if (!pin || (pin || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty PIN',
        'PIN value can not be empty',
      );
    }
    if (
      (pin || '').toString().length < 4 ||
      (pin || '').toString().length > 4
    ) {
      throw new NotAcceptableException('Invalid PIN', 'PIN value is invalid');
    }
    if (!username || (username || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty PIN',
        'Username value can not be empty',
      );
    }
    if (
      (pin || '').toString().length < 4 ||
      (pin || '').toString().length > 4
    ) {
      throw new NotAcceptableException('Invalid PIN', 'PIN value is invalid');
    }
    if (!deviceId || (deviceId || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty deviceId',
        'deviceId can not be empty',
      );
    }

    const loggedInAdmin = await this.authService.getAdminUserAt({
      activeDeviceId: deviceId,
      isActive: true,
    });

    if (loggedInAdmin && (loggedInAdmin || {}).name !== username) {
      throw new BadRequestException('Invalid username or password ');
    }

    try {
      const { token } = await this.authService.login(pin, deviceId, username);

      return { token, code: 0, description: 'operation successful' };
    } catch (exp) {
      if (exp.response) throw exp;
      throw new InternalServerErrorException(
        'Error authenticating user',
        exp?.name === 'EntityNotFound'
          ? /deviceId/g.test(exp)
            ? 'Device is not recognized, register this device before you can login with it'
            : 'Invalid username or pin'
          : exp,
      );
    }
  }

  @Post('/pinLogout')
  @UseMiddleware('protection')
  async pinLogout(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    await this.authService.logout(req);

    resp.json({ code: 0, description: 'operation successful' });
  }

  @Post('/addAdmin')
  @UseMiddleware('allowRoute', 'superAdminProtection')
  async addAdmin(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
    @Body() body: AddAdminDto,
  ) {
    const { name, email, type } = req.body;
    const { super_admin_key } = req.headers;

    if (!name || (name || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty name',
        'Name field can not be empty',
      );
    }
    if (!email || (email || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty email',
        'email field can not be empty',
      );
    }
    if (!emailRegex.test(email || '')) {
      throw new NotAcceptableException('Invalid email', 'email is invalid');
    }

    if (
      type === adminClass.SUPER &&
      super_admin_key !== process.env.SUPER_ADMIN_KEY
    ) {
      throw new UnauthorizedException(
        'You are unauthorized to perform this operation',
      );
    }

    try {
      const addAdminResp = await this.authService.addAdminUser({
        name,
        email,
        type: type || adminClass.SUB,
        isActive: false,
      });

      await sendMail(
        email,
        'You are now an admin on Rechargeam',
        `Hi ${name} \n you have been successfully added as an admin on Rechargeam you 4 digit pin is ${addAdminResp.pin}`,
      );

      resp.json({
        message: 'admin has been added successfull. Check email to find pin',
        code: 0,
      });
    } catch (exp) {
      throw new InternalServerErrorException(
        'Unable to register user as admin',
        'Admin user already exsits',
      );
    }
  }

  @Post('/registerDevice')
  async registerDevice(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
    @Body() body,
  ) {
    const { deviceId, deviceModel, pushToken } = body;

    if (!deviceModel || (deviceModel || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty device model',
        'device model field can not be empty',
      );
    }
    if (!deviceId || (deviceId || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty device id',
        'Device id field can not be empty',
      );
    }
    if (!pushToken || (pushToken || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty push token',
        'push token field can not be empty',
      );
    }

    try {
      const device = await this.authService.regDevice(
        deviceId,
        deviceModel,
        pushToken,
      );
      return {
        code: 0,
        description: 'operation successful',
        device,
      };
    } catch (exp) {
      throw new InternalServerErrorException(
        'Unable to register user',
        'Unable to register user' + exp,
      );
    }
  }

  @Post('/forgetPin')
  async forgetPin(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
    @Body() body,
  ) {
    const { email } = body;
    if (!email || (email || '').toString().length === 0) {
      throw new NotAcceptableException(
        'Empty email',
        'email field can not be empty',
      );
    }

    try {
      console.log('generating pin');
      const { pin, name } = await this.authService.forgetPin(email);
      console.log('sending mail');
      await sendMail(
        email,
        'Forget Pin',
        `Hi ${name} \n Your new 4 digit pin is ${pin}`,
      );

      return {
        code: 0,
        description:
          'operation successful. Your pin has been successfully sent to your email',
      };
    } catch (exp) {
      throw new InternalServerErrorException(
        'Unable to register user',
        'Unable to register user' + exp,
      );
    }
  }

  @Post('/authenticate')
  login(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {}

  @Post('/register')
  register(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {}
}

export { AuthController };
