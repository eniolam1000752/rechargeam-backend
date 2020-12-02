import { Controller, Next, Post, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service';
import 'reflect-metadata';
import { Middleware, useMiddleware } from 'src/lib/decorators/middleware';

@Controller('/api/')
class AuthController {
  constructor(private authService: AuthService) {}

  @Middleware
  loginMiddle(req, resp, next) {
    resp.send('middle ware 1');
  }
  @Middleware
  validateUser(req, resp, next) {
    next();
    resp.send('middle ware 2');
  }

  @Post('/pinLogin')
  pinLogin(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {
    console.log('kjalkdjaljdfa');
    return 'hey';
  }

  @Post('/pinLogout')
  pinLogout(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {
    console.log('kjalkdjaljdfa');
    return 'hey';
  }

  @Post('/addAdmin')
  addAdmin(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {}

  @Post('/removeAdmin')
  removeAdmin(
    @Req() req: Request,
    @Res({ passthrough: true }) resp: Response,
  ) {}

  @Post('/authenticate')
  login(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {}

  @Post('/register')
  register(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {}
}

export { AuthController };
