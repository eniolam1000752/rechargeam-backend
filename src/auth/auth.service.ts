import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { adminClass, AdminUser } from 'src/db/entities/AdminUserEntity';
import { Admin, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Devices } from 'src/db/entities/DevicesEntity';
import { Request } from 'express';

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
    const user = await this.adminUser.findOneOrFail({ name: username });
    const device = await this.device.findOneOrFail({ deviceId });

    const isValid = await bcrypt.compare(pin, user.pin);

    console.log(isValid);

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
    });

    await this.device.save({ id: device.id, user, isActive: true });

    return { token, user: { name: user.name, email: user.email } };
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
      token: '',
    });

    return { pin: genPin, name: user.name };
  }

  logout(req) {
    if (req?.userData?.userId) {
      return this.adminUser.save({
        id: req.userData.userId,
        isActive: false,
        token: '',
        activeDeviceId: '',
      });
    } else {
      return { code: 0 };
    }
  }

  async regDevice(deviceId, deviceModel, pushToken) {
    const device = await this.device.findOne({ deviceId });
    if (Boolean(device)) {
      this.device.save({ id: device.id, pushToken });
      return device;
    } else {
      const device = new Devices();
      device.deviceId = deviceId;
      device.isActive = false;
      device.pushToken = pushToken;
      device.deviceModel = deviceModel;
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
      // const rawPin = await bcrypt.

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

    // console.log(genPin);

    let user = new AdminUser();
    user = {
      ...user,
      name,
      email,
      type: type as any,
      isActive,
      pin: await bcrypt.hash(genPin, this.saltOrRounds),
    };
    await this.adminUser.save(user);
    return { pin: genPin };
  }

  async authorize(req: Request & { userData: any }, resp: Response) {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new InternalServerErrorException(
        'Unauthorized request',
        'This is an unauthorized request',
      );
    }

    const token = (authorization as string).match(/(?<=(Bearer )).*/g)?.[0];
    const unTokenized: any = this.jwtService.decode(token);
    const user = await this.adminUser.findOneOrFail({
      id: unTokenized.userId,
    });

    if (token !== user.token) {
      throw new InternalServerErrorException('Session Timeout');
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

    const token = (authorization as string).match(/(?<=(Bearer )).*/g)?.[0];
    const unTokenized: any = this.jwtService.decode(token);
    const user = await this.adminUser.findOne({
      id: unTokenized?.userId,
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

export { AuthService };
