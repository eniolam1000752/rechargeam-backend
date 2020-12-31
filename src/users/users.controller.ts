import {
  BadRequestException,
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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { NextFunction, Request, response, Response } from 'express';
import { UserService } from './users.service';
import 'reflect-metadata';
import { Middleware, UseMiddleware } from 'src/lib/decorators/middleware';
import { sendMail } from '../lib/mailer';
import { AuthService } from 'src/auth/auth.service';
import { adminClass } from 'src/db/entities/AdminUserEntity';
import { getSettingsReq, saveSettingsReq } from './users.dto';
import { IUntokenized } from 'src/lib/types/global';

@Controller('/api/user')
// @UseGuards(Authorize)
class UserController {
  private readonly emailRegex: RegExp;

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Middleware
  async adminProtection(req, resp) {
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
      isRemoved: false,
    });
    resp.json({
      code: 0,
      description: 'operation successful',
      users: users.map((item) => {
        delete item.id;
        delete item.pin;
        delete item.token;
        return item;
      }),
    });
    // await this.userService.testing(req, resp);
  }

  @Post('/removeAdmin')
  @UseMiddleware('superAdminProtection')
  async removeAdmin(
    @Req() req: Request & { userData: any },
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { email } = req.body;
    const { id } = req.userData;

    if ((email || '').length <= 0)
      throw new NotAcceptableException(null, 'email cannot be empty');

    await this.userService.removeAdmin(email, id);

    return resp.json({ descriptoin: 'operation successful', code: 0 });
  }

  @Post('/getSettings')
  @UseMiddleware('adminProtection')
  async getSettings(
    @Req()
    req: Request<null, null, getSettingsReq> & { userData: IUntokenized },
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { type } = req.body;
    const { userId } = req.userData;
    const user = await this.userService.getUserAt({ id: userId });

    if (!user) throw new UnauthorizedException('Session time out');

    const { settings } = await this.userService.getSettings(user, type);
    resp.json({ settings, code: 0, description: 'operation successful' });
  }

  @Post('/saveSettings')
  @UseMiddleware('adminProtection')
  async saveSettings(
    @Req()
    req: Request<null, null, saveSettingsReq> & { userData: IUntokenized },
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { processors, ussdSchemas } = req.body;
    if (!processors && !ussdSchemas) {
      throw new BadRequestException(
        'processors and ussdSchemas field cannot be empty',
      );
    }
    if (ussdSchemas && !ussdSchemas.processor) {
      throw new BadRequestException(
        'A USSD schema cannot be created without a processor',
      );
    }
    if (ussdSchemas && !ussdSchemas.debitOperation) {
      throw new BadRequestException(
        'A USSD schema cannot be created without a debit operation',
      );
    }
    if (ussdSchemas && !ussdSchemas.ussdAction) {
      throw new BadRequestException(
        'A USSD schema cannot be created without a ussdAction',
      );
    }
    if (ussdSchemas && !ussdSchemas.ussdCodeFormat) {
      throw new BadRequestException(
        'A USSD schema cannot be created without a ussdCodeFormat',
      );
    }

    const { userId } = req.userData;
    const user = await this.userService.getUserAt({ id: userId });
    const setting = await this.userService.saveSettings(user, req.body);

    resp.json({ code: 0, description: 'operation was successful', setting });
  }

  @Post('/editSettings')
  @UseMiddleware('adminProtection')
  async editSettings(
    @Req()
    req: Request & { userData: IUntokenized },
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { processors, ussdSchemas } = req.body;
    if (!processors && !ussdSchemas) {
      throw new BadRequestException(
        'processors and ussdSchemas field cannot be empty',
      );
    }

    const { userId } = req.userData;
    const user = await this.userService.getUserAt({ id: userId });
    const setting = await this.userService.editSettings(user, {
      processors,
      ussdSchemas,
    });

    resp.json({ code: 0, description: 'operation was successful', setting });
  }

  @Post('/deleteSchema')
  @UseMiddleware('adminProtection')
  async deleteSchema(
    @Req()
    req: Request & { userData: IUntokenized },
    @Res({ passthrough: true }) resp: Response,
  ) {
    const { schemaId } = req.body;
    if (!schemaId) {
      throw new BadRequestException('id cannot be empty');
    }

    await this.userService.deleteSchema(schemaId);

    resp.json({ code: 0, description: 'operation was successful' });
  }
}

export { UserController };
