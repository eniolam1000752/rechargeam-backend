import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Customer } from 'src/db/entities/CustomerEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'src/db/entities/RequestsEntity';
import { DebitOperation } from 'src/lib/constants';
import { PushNotifier } from 'src/logger/logger.service';
import { Repository } from 'typeorm';

@Injectable()
export class RechargeRequestService {
  constructor(
    @InjectRepository(Request) private requestRepo: Repository<Request>,
    @InjectRepository(AdminUser) private adminUser: Repository<AdminUser>,
    @InjectRepository(Devices) device: Repository<Devices>,
    private readonly pushNotify: PushNotifier,
  ) {}

  async sendRequest(
    customer: Customer,
    amount: string,
    debitOperation: DebitOperation,
  ) {
    const adminUser = await this.adminUser.find({ isActive: true });

    console.log(adminUser);
  }
}
