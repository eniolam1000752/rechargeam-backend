import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { adminClass, AdminUser } from 'src/db/entities/AdminUserEntity';
import { Admin, In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'express';
import { Customer } from 'src/db/entities/CustomerEntity';
import { IRegisterPayload } from './auth.dto';
import { Referrals } from 'src/db/entities/Referrals';
import { Wallet } from 'src/db/entities/Wallet';

@Injectable()
class AuthService {
  loginList: Array<string> = [];
  saltOrRounds = 10;

  constructor(
    @InjectRepository(AdminUser) public adminUser: Repository<AdminUser>,
    @InjectRepository(Devices) public device: Repository<Devices>,
    private jwtService: JwtService,
  ) {}

  async getAdminUserAt(data): Promise<AdminUser> {
    return await this.adminUser.findOne(data);
  }

  getAllAdminUser(data): Promise<AdminUser[]> {
    return this.adminUser.find(data);
  }

  getRepos() {
    return { adminUser: this.adminUser, device: this.device };
  }

  async login(pin, deviceId, username) {
    // const hPin = await bcrypt.hash(pin, this.saltOrRounds);
    const user = await this.adminUser.findOneOrFail({
      name: username?.toLowerCase(),
      isRemoved: false,
    });
    const device = await this.device.findOneOrFail({ deviceId });

    const isValid = await bcrypt.compare(pin, user.pin);

    if (!isValid) {
      throw new BadRequestException('Invalid username or pin');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      deviceId: device.id,
      userType: user.type,
      createdTime: new Date().getTime(),
    });

    await this.adminUser.save({
      id: user.id,
      token,
      isActive: true,
      activeDeviceId: deviceId,
      aDevice: device,
    });
    await this.device.save({ id: device.id, user, isActive: true });

    return {
      token,
      user: { name: user.name, email: user.email, type: user.type },
    };
  }

  async forgetPin(email) {
    const user = await this.adminUser.findOne({ email });
    if (!user) throw new BadRequestException('User does not exsist');

    const users = await this.adminUser.find();

    const generatePin = async () => {
      let output = '';
      let genPin = Math.random()
        .toString()
        .match(/(?<=\d\.)\d+/g)[0];
      output = genPin.slice(genPin.length - 4, genPin.length);

      // note this is a bad implementation but this is just temporary
      let pinExists = false;
      if (users.length === 10 ** 4) {
        throw new InternalServerErrorException(
          'Maximum number of admins allowable reached',
        );
      }
      for (let adminUser of users) {
        if (await bcrypt.compare(output, adminUser.pin)) {
          pinExists = true;
          break;
        }
      }
      // =====
      if (pinExists) output = await generatePin();
      return output;
    };

    const genPin = await generatePin();

    await this.adminUser.save({
      id: user.id,
      pin: await bcrypt.hash(genPin, this.saltOrRounds),
      activeDeviceId: '',
      aDevice: null,
      token: '',
    });

    return { pin: genPin, name: user.name };
  }

  async logout(req) {
    if (req?.userData?.userId) {
      return this.adminUser.save({
        id: req.userData.userId,
        isActive: false,
        token: '',
        activeDeviceId: '',
        aDevice: null,
      });
    } else {
      return { code: 0 };
    }
  }

  async regDevice(deviceId, deviceModel, pushToken) {
    const device = await this.device.findOne({ deviceId });
    if (Boolean(device)) {
      this.device.save({ id: device.id, pushToken, updatedAt: new Date() });
      return device;
    } else {
      const device = new Devices();
      device.deviceId = deviceId;
      device.isActive = false;
      device.pushToken = pushToken;
      device.deviceModel = deviceModel;
      device.createdAt = device.updatedAt = new Date();
      await this.device.save(device);
      return device;
    }
  }

  async addAdminUser({
    name,
    email,
    type,
    isActive,
  }: {
    name: string;
    email: string;
    type: 'SUPER' | 'SUB';
    isActive: boolean;
  }) {
    const generatePin = async () => {
      let output = '';
      let genPin = Math.random()
        .toString()
        .match(/(?<=\d\.)\d+/g)[0];
      output = genPin.slice(genPin.length - 4, genPin.length);

      // note this is a bad implementation but this is just temporary
      let pinExists = false;
      const users = await this.adminUser.find();
      if (users.length === 10 ** 4) {
        throw new InternalServerErrorException(
          'Maximum number of admins allowable reached',
        );
      }
      for (let user of users) {
        if (await bcrypt.compare(output, user.pin)) {
          pinExists = true;
          break;
        }
      }
      if (pinExists) output = await generatePin();
      return output;
    };

    const genPin = await generatePin();

    let user = new AdminUser();
    user = {
      ...user,
      name: name?.toLowerCase(),
      email,
      type: type as any,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      pin: await bcrypt.hash(genPin, this.saltOrRounds),
    };
    await this.adminUser.save(user);
    return { pin: genPin };
  }

  async authorize(req: Request & { userData: any }, resp: Response) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException(
        'Unauthorized request',
        'This is an unauthorized request',
      );
    }

    const token = (authorization as string).match(/(?<=([b|B]earer )).*/g)?.[0];
    const unTokenized: any = this.jwtService.decode(token);
    let user = {} as AdminUser;

    try {
      user = await this.adminUser.findOneOrFail({
        id: unTokenized.userId,
        isRemoved: false,
      });
    } catch (exp) {
      if (exp.name === 'EntityNotFound') {
        throw new UnauthorizedException(
          'Unauthorized request',
          'This is an unauthorized request',
        );
      } else {
        throw new InternalServerErrorException('Internal server error', exp);
      }
    }

    if (token !== user.token) {
      throw new UnauthorizedException('Session Timeout');
    }

    req.userData = unTokenized;
  }

  async superAdminAuthorize(
    req: Request & { userData: any; allow: boolean },
    resp: Response,
  ) {
    console.log(req.allow);
    if (req.allow) return 0;

    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException(
        'Unauthorized request',
        'This is an unauthorized request',
      );
    }

    const token = (authorization as string).match(/(?<=([b|B]earer )).*/g)?.[0];
    const unTokenized: any = this.jwtService.decode(token);
    const user = await this.adminUser.findOne({
      id: unTokenized?.userId,
      isRemoved: false,
    });

    if (!user) {
      throw new InternalServerErrorException('User does not exsist');
    }
    if (token !== user.token) {
      throw new InternalServerErrorException('Session Timeout');
    }
    if (user.type !== adminClass.SUPER) {
      throw new InternalServerErrorException('Unauthorized access');
    }

    req.userData = { ...unTokenized, userType: user.type };
  }
}

@Injectable()
class CustomerAuthService {
  saltOrRounds = 10;
  jwtExpire = 3.5;

  constructor(
    @InjectRepository(Customer) public customer: Repository<Customer>,
    @InjectRepository(Referrals) public referralRepo: Repository<Referrals>,
    @InjectRepository(Wallet) public walletRepo: Repository<Wallet>,
    private jwtService: JwtService,
  ) {}

  async login(email, password) {
    let user: Customer;

    try {
      user = await this.customer.findOneOrFail({
        email: email.toLowerCase(),
      });
    } catch (exp) {
      console.log(exp);
      throw new UnauthorizedException(null, 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('Invalid email or  password');
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      createdTime: new Date().getTime(),
    });

    try {
      await this.customer.save({
        id: user.id,
        token,
        isActive: true,
      });

      delete user.password;
      delete user.id;
      delete user.requests;
      delete user.token;

      return { token, user };
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing error');
    }
  }

  async registerCustomer(data: IRegisterPayload) {
    let customer = await this.customer.findOne({ email: data.email });
    let referrer = new Customer();

    if (customer) {
      throw new ForbiddenException(
        null,
        'A user with this email already exsits',
      );
    }

    const genReferalCode = `${data.username}-${Math.round(
      100000 * Math.random(),
    )}`;

    customer = new Customer();
    // ${process.env.FRONT_END_BASE_URL}signUP/

    customer.email = data.email;
    customer.username = data.username;
    customer.phoneNumber = data.phoneNumber;
    customer.createdAt = new Date();
    customer.updatedAt = new Date();
    customer.isActive = false;
    customer.otherPhones = (data.otherPhones as any) || [];
    customer.password = await bcrypt.hash(data.password, this.saltOrRounds);
    customer.referralUrl = genReferalCode;

    let wallet = new Wallet();
    wallet.createdAt = new Date();
    wallet.updatedAt = new Date();

    try {
      if (data.referalCode) {
        referrer = await this.customer.findOneOrFail({
          where: { referralUrl: data.referalCode },
          relations: [
            'otherPhones',
            'referrees',
            'referrees.referrer',
            'referral',
            'referral.customer',
          ],
        });
      }
    } catch (exp) {
      console.log(exp);
      throw new NotAcceptableException(null, 'invalid referral code provided');
    }

    try {
      console.log(customer);
      customer = await this.customer.save(customer);
      wallet = await this.walletRepo.save(wallet);

      customer = await this.customer.save({ id: customer.id, wallet });
      wallet = await this.walletRepo.save({ id: wallet.id, customer });
    } catch (exp) {
      console.log(exp);
      if (exp.errno === 1062) {
        throw new NotAcceptableException(
          null,
          'A customer with this username already exists',
        );
      } else {
        throw new InternalServerErrorException(
          null,
          'Request processing error',
        );
      }
    }

    if (data.referalCode) {
      try {
        const referral = await this.referralRepo.save({
          customer,
          referrer,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.customer.save([
          { id: referrer.id, referrees: [...referrer.referrees, referral] },
          { id: customer.id, referral },
        ]);
      } catch (exp) {
        console.log(exp);
        throw new NotFoundException(null, 'invalid referral code provided');
      }
    }
  }

  async customerAuthorize(req: Request & { customerData: any }) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new UnauthorizedException(
        'Unauthorized request',
        'This is an unauthorized request',
      );
    }

    const token = (authorization as string).match(/(?<=([b|B]earer )).*/g)?.[0];
    const unTokenized: any = this.jwtService.decode(token);
    let user = {} as Customer;

    try {
      user = await this.customer.findOneOrFail({
        id: unTokenized.userId,
      });
    } catch (exp) {
      if (exp.name === 'EntityNotFound') {
        throw new UnauthorizedException(
          'Unauthorized request',
          'This is an unauthorized request',
        );
      } else {
        throw new InternalServerErrorException('Internal server error', exp);
      }
    }

    const savedUnTokenized: {
      userId: number;
      createdTime: number;
    } = this.jwtService.decode(user.token) as any;

    if (
      new Date().getTime() - savedUnTokenized.createdTime <=
      this.jwtExpire * 60000
    ) {
      this.customer.save({
        id: user.id,
        token: this.jwtService.sign({
          userId: user.id,
          createdTime: new Date().getTime(),
        }),
      });
    } else {
      throw new UnauthorizedException(null, 'Session timeout');
    }

    req.customerData = user;
  }

  async getCustomerData(customer: Customer) {
    try {
      const result = await this.customer.findOne({
        where: { id: customer.id },
        relations: [
          'otherPhones',
          'referrees',
          'referrees.customer',
          'referral',
          'referral.referrer',
          'wallet',
        ],
      });
      delete result.password;
      delete result.token;
      delete result.id;
      delete result.referral?.referrer.password;
      delete result.referral?.referrer.token;

      result.referralUrl = `${process.env.FRONT_END_BASE_URL}signUp/?referral=${result.referralUrl}`;

      for (let refreeIndex in result.referrees) {
        delete result.referrees[refreeIndex]?.customer?.token;
        delete result.referrees[refreeIndex]?.customer?.password;
      }

      return result;
    } catch (exp) {
      console.log(exp);
      throw new InternalServerErrorException(null, 'Request processing erro');
    }
  }
}

export { AuthService, CustomerAuthService };
