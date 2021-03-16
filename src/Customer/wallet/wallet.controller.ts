import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  Res,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Paystack } from 'src/lib/paystack';
import { CustomerAuthService } from 'src/auth/auth.service';
import { Middleware } from 'src/lib/decorators/middleware';
import { Customer } from 'src/db/entities/CustomerEntity';
import { Request, Response } from 'express';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly custAuth: CustomerAuthService,
  ) {}

  @Middleware
  async customerAuth(req, resp) {
    await this.custAuth.customerAuthorize(req);
  }

  @Post()
  fundWallet(@Req() req: Request, @Res({ passthrough: true }) resp: Response) {
    // const customer = req.customerData;
    // const { amount } = req.body;
  }

  // @Get()
  // findAll() {
  //   return this.walletService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.walletService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.walletService.remove(+id);
  // }
}
