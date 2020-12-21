import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Next,
  NotAcceptableException,
  Post,
  Req,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { NextFunction, Request, response, Response } from 'express';
import { UserService } from './users.service';
import 'reflect-metadata';
import { Middleware, UseMiddleware } from 'src/lib/decorators/middleware';
import { sendMail } from '../lib/mailer';
import { AuthService } from 'src/auth/auth.service';
import { adminClass } from 'src/db/entities/AdminUserEntity';

@Controller('/api')
// @UseGuards(Authorize)
class UserController {
  private readonly emailRegex: RegExp;

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Middleware
  async protection(req, resp) {
    await this.authService.authorize(req, resp);
  }

  @Middleware
  async superAdminProtection(req, resp) {
    await this.authService.superAdminAuthorize(req, resp);
  }

  @Get('/getAdmins')
  @UseMiddleware('superAdminProtection')
  async getAdmins(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {
    const users = await this.userService.getAllAdminUser({
      type: adminClass.SUB,
    });
    resp.json({
      code: 0,
      description: 'operation successful',
      users: users.map((item) => {
        delete item.pin;
        delete item.token;
        return item;
      }),2
    });
    // await this.userService.testing(req, resp);
  }

  @Post('/removeAdmin')
  removeAdmin(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {}

  @UseMiddleware('protection')
  @Post('/getSettings')
  getSettings(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {

  }
}

export { UserController };
