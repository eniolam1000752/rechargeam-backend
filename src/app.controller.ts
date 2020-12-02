import { Post } from '@nestjs/common';
import { Res } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

class LoginResponseDTO {
  username: string;
}

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    // console.log(this.authService.loginList);
    return this.appService.getHello();
  }
}
