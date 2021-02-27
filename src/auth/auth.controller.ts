import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import { AuthService, CustomerAuthService } from './auth.service';
import 'reflect-metadata';
import { AddAdminDto, PinLoginRequest } from './auth.dto';
import { sendMail } from '../lib/mailer';
import { config } from 'dotenv';
import { adminClass } from 'src/db/entities/AdminUserEntity';
import { Middleware, UseMiddleware } from 'src/lib/decorators/middleware';
import { emailRegex } from 'src/lib/constants';
import { Customer } from 'src/db/entities/CustomerEntity';

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

    // const loggedInAdmin = await this.authService.getAdminUserAt({
    //   activeDeviceId: deviceId,
    //   isActive: true,
    // });

    // if (loggedInAdmin && (loggedInAdmin || {}).name !== username) {
    //   throw new BadRequestException('Invalid username or password ');
    // }

    try {
      const { token, user } = await this.authService.login(
        pin,
        deviceId,
        username,
      );

      return {
        token,
        code: 0,
        description: 'operation successful',
        userType: user.type,
      };
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
        exp,
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
}

@Controller('/api/customer')
class CustomerAuthController {
  constructor(private readonly custAuthService: CustomerAuthService) {}

  @Middleware
  async customerGuard(req, resp) {
    await this.custAuthService.customerAuthorize(req);
  }

  @Post('/login')
  async login(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {
    const { email, password } = req.body;

    if (!email || (email || '').toString().length === 0) {
      throw new NotAcceptableException(null, 'Email value cannot be empty');
    }
    if ((password || '').toString().length === 0) {
      throw new NotAcceptableException(null, 'Password field cannot be empty');
    }
    if (
      !(
        /[A-Z]+/g.test(password) &&
        /[a-z]+/g.test(password) &&
        /[0-9]/g.test(password) &&
        /[@|_|#|\$|%|\s|\^|&|\*\\|\(|\)\-|\+]/g.test(password)
      ) &&
      password.length < 8
    ) {
      console.log('invalid password pattern provided');
      throw new NotAcceptableException(null, 'invaid username/password');
    }

    try {
      const { token } = await this.custAuthService.login(email, password);

      return { token, code: 0, description: 'operation successful' };
    } catch (exp) {
      if (exp.response) throw exp;

      throw new InternalServerErrorException('Error authenticating user', exp);
    }
  }

  @Post('/register')
  async register(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const {
      email,
      password,
      cpassword,
      phoneNumber,
      otherPhones,
      username,
      referalCode,
    } = req.body;

    if (!email || (email || '').toString().length === 0) {
      throw new NotAcceptableException(null, 'Email value cannot be empty');
    }
    if (!emailRegex.test(email)) {
      throw new NotAcceptableException(null, 'Invalid email provided');
    }
    if ((password || '').toString().length === 0) {
      throw new NotAcceptableException(null, 'Password field cannot be empty');
    }
    if (password !== cpassword) {
      throw new NotAcceptableException(
        null,
        'Miss-match in password and confrim password',
      );
    }
    if (
      !(
        /[A-Z]+/g.test(password) &&
        /[a-z]+/g.test(password) &&
        /[0-9]/g.test(password) &&
        /[@|_|#|\$|%|\s|\^|&|\*\\|\(|\)\-|\+]/g.test(password)
      ) &&
      password.length < 8
    ) {
      throw new NotAcceptableException(
        'invalid password',
        'Invalid password provided. Password must contain At least one upperCase, lower case a digit and special character and must be eight(8) or more characters logn',
      );
    }
    if (!phoneNumber || (phoneNumber || '').toString().length === 0) {
      throw new NotAcceptableException(null, ' phone number cannot be empty');
    }
    if (!username || (username || '').toString().length === 0) {
      throw new NotAcceptableException(null, ' username cannot be empty');
    }

    const addAdminResp = await this.custAuthService.registerCustomer({
      email,
      username,
      otherPhones,
      password,
      phoneNumber,
      referalCode,
    });

    sendMail(
      email,
      'Email verification',
      `Hi ${username}, 
         welcome to Rechargeam verify your email by clicking on this link below`,
    );

    resp.json({
      message:
        'Customer has been successfuly created, verify your email by clicking on the link sent to the email address provided',
      code: 0,
    });
  }

  @Get('getUser')
  @UseMiddleware('customerGuard')
  async getUser(
    @Req() req: Request & { customerData: Customer },
    @Res({ passthrough: true }) resp: Response,
  ) {
    let customer = req.customerData;
    customer = await this.custAuthService.getCustomerData(customer);

    console.log(customer);
    resp.json({
      customer,
      description: 'operation successful',
      code: 0,
    });
  }

  @Get('updateUser')
  @UseMiddleware('customerGuard')
  async updateUser(
    @Req() req: Request & { customerData: Customer },
    @Res({ passthrough: true }) resp: Response,
  ) {
    let customer = req.customerData;
    customer = await this.custAuthService.getCustomerData(customer);

    console.log(customer);
    resp.json({
      customer,
      description: 'operation successful',
      code: 0,
    });
  }
}

export { AuthController, CustomerAuthController };
