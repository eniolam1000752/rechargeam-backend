import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddAdminDto } from 'src/auth/auth.dto';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Customer } from 'src/db/entities/CustomerEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'src/db/entities/RequestsEntity';
import { DebitOperation, MobileOperators } from 'src/lib/constants';
import { PushNotifier } from 'src/logger/logger.service';
import { Admin, Repository } from 'typeorm';

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
    phoneNumber: string,
    processor: MobileOperators,
  ) {
    let adminToProcessRequest: AdminUser = null;
    const adminUsers = await this.adminUser.find({ isActive: true });

    for (let adminUser of adminUsers) {
      if (
        new RegExp(processor, 'g').test(adminUser?.aDevice?.setting?.processors)
      ) {
        adminToProcessRequest = adminUser;
        break;
      }
    }

    if (!adminToProcessRequest) {
      throw new NotFoundException(
        'NO devices found',
        'Unable to process your request at the moment please try again later',
      );
    }

    const request = {
      ...new Request(),
      createdAt: new Date(),
      updatedAt: new Date(),
      amount,
      processor,
      debitOperation,
      phoneNumber,
      customer,
    } as Request;

    // this.requestRepo.save(request);

    // delete request.customer.id;
    // delete request.customer.isActive;
    // delete request.customer.password;
    // delete request.customer.requests;
    // delete request.customer.token;

    // await this.pushNotify.push(
    //   adminToProcessRequest?.aDevice?.pushToken,
    //   request,
    //   {
    //     body:
    //       'A request to process a transacton was just received and its been processed',
    //     title: `incomming request from ${customer.firstname} ${customer.lastname}`,
    //   },
    // );

    console.log(adminToProcessRequest);
  }
}
