import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddAdminDto } from 'src/auth/auth.dto';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Customer } from 'src/db/entities/CustomerEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request, Status } from 'src/db/entities/RequestsEntity';
import { DebitOperation, MobileOperators } from 'src/lib/constants';
import { PushNotifier } from 'src/logger/logger.service';
import { Admin, Repository } from 'typeorm';

@Injectable()
export class RechargeRequestService {
  constructor(
    @InjectRepository(Request) private requestRepo: Repository<Request>,
    @InjectRepository(AdminUser) private adminUser: Repository<AdminUser>,
    @InjectRepository(Devices) private device: Repository<Devices>,
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

    let request = new Request();

    request.createdAt = new Date();
    request.updatedAt = new Date();
    request.amount = amount;
    request.processor = processor;
    request.debitOperation = debitOperation;
    request.phoneNumber = phoneNumber;
    request.status = Status.SENT;

    request.customer = customer;
    request.admin = adminToProcessRequest;
    request.device = adminToProcessRequest.aDevice;

    request = await this.requestRepo.save(request);

    request.customer = {
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      profileImage: customer.profileImage,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    } as Customer;

    delete request.admin;
    delete request.device;

    await this.pushNotify.push(
      adminToProcessRequest?.aDevice?.pushToken,
      { data: JSON.stringify(request as any) },
      {
        body:
          'A request to process a transaction was just received and its been processed',
        title: `incoming request from ${customer.firstname} ${customer.lastname}`,
      },
    );

    console.log(adminToProcessRequest);
  }

  async getRequests(adminId: number, type?: 'all' | null) {
    const admin = await this.adminUser.findOne({ id: adminId });
    const activeDevice = admin.aDevice;
    console.log('ACTIVE DEVICE ID ====> ', activeDevice);
    return await this.requestRepo.find(
      Object.assign(
        { order: { updatedAt: 'DESC' } },
        type === 'all' ? { admin } : { deviceId: activeDevice.id },
      ),
    );
  }

  async updateRequest(requestId: number, status: Status, ref?: string) {
    await this.requestRepo.save({
      id: requestId,
      status,
      updatedAt: new Date(),
      ref,
    });
  }
}
