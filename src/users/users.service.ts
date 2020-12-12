import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  Req,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Repository } from 'typeorm';
import { NextFunction, Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { adminClass } from '../db/entities/AdminUserEntity';

@Injectable()
class UserService {
  loginList: Array<string> = [];
  saltOrRounds = 10;

  constructor(
    private authService: AuthService,
    @InjectRepository(AdminUser) private adminUser: Repository<AdminUser>,
  ) {}

  getAllAdminUser(data): Promise<AdminUser[]> {
    return this.adminUser.find(data);
  }

  async getSubAdmins(req: Request, resp: any) {
    return await this.adminUser.find({ type: adminClass.SUB });
  }
}

export { UserService };
