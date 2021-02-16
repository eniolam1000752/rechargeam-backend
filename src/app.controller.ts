import { Post, Res, Req, Controller, Get } from '@nestjs/common';
import {} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { Middleware } from './lib/decorators/middleware';
import { UserService } from './Admin/users/users.service';

class LoginResponseDTO {
  username: string;
}

@Controller('/api')
export class AppController {
  constructor() {}

  @Middleware
  protected() {}

  @Get('/health')
  health(@Req() req: Request, @Res() resp: Response) {
    resp.json({
      status: 'server is up',
      routes: (global as any).app
        .getHttpServer()
        ._events.request._router.stack.map((item) => item.route?.path)
        .filter((item) => item),
    });
  }
}
