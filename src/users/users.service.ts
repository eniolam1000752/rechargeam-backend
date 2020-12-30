import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  NotAcceptableException,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from 'src/db/entities/AdminUserEntity';
import { Repository } from 'typeorm';
import { NextFunction, Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { adminClass } from '../db/entities/AdminUserEntity';
import { getSettingsReq, saveSettingsReq } from './users.dto';
import { Setting } from 'src/db/entities/SettingsEntity';
import { Devices } from 'src/db/entities/DevicesEntity';
import { UssdSchema } from 'src/db/entities/UssdSchemaEntity';
import { settings } from 'cluster';

@Injectable()
class UserService {
  loginList: Array<string> = [];
  saltOrRounds = 10;

  constructor(
    private authService: AuthService,
    @InjectRepository(AdminUser) private adminUser: Repository<AdminUser>,
    @InjectRepository(Setting) private setting: Repository<Setting>,
    @InjectRepository(Devices) private device: Repository<Devices>,
    @InjectRepository(UssdSchema) private ussdSchema: Repository<UssdSchema>,
  ) {}

  getAllAdminUser(data): Promise<AdminUser[]> {
    return this.adminUser.find(data);
  }

  getUserAt(data): Promise<AdminUser> {
    return this.adminUser.findOneOrFail(data);
  }

  async getSubAdmins(req: Request, resp: any) {
    return await this.adminUser.find({ type: adminClass.SUB });
  }

  async getSettings(user: AdminUser, type?: 'all' | 'ussd' | null) {
    const { activeDeviceId } = user;
    const _device = await this.device.findOne({ deviceId: activeDeviceId });
    // const settings = await this.setting.findOne({ device: _device });
    const settingsByUser = await this.setting.find({ user });
    const settings = settingsByUser.find(
      (item) => item.device?.id === _device?.id,
    );
    if (settings) {
      const outputSettings =
        type === 'all'
          ? {
              processors: settings.processors.split('|'),
              ussdSchemas: settingsByUser.reduce(
                (cum, item) => cum.concat(item.schema),
                [],
              ),
            }
          : {
              ussdSchemas: settingsByUser.reduce(
                (cum, item) => cum.concat(item.schema),
                [],
              ),
            };
      return { settings: outputSettings };
    } else {
      return { settings: null };
    }
  }

  async saveSettings(user: AdminUser, dataToSave: saveSettingsReq) {
    const { activeDeviceId } = user;
    const { processors, ussdSchemas } = dataToSave;
    const device = await this.device.findOne({ deviceId: activeDeviceId });
    const setting = await this.setting.findOne({ device });
    const ussdSchema = await this.ussdSchema.findOne({
      processor: ussdSchemas.processor,
      debitOperation: ussdSchemas.debitOperation,
    });

    let settingCreatedForDevice = Boolean(setting);

    console.log(setting, settingCreatedForDevice);

    if (processors) {
      if (!settingCreatedForDevice) {
        const newSetting = new Setting();
        const date = new Date();

        newSetting.processors = processors.join('|');
        newSetting.device = device;
        newSetting.user = user;
        newSetting.updatedAt = newSetting.createdAt = date;
        await this.setting.save(newSetting);
      } else {
        setting.processors = processors.join('|');
        setting.updatedAt = new Date();
        setting.device = device;
        setting.user = user;
        await this.setting.save(setting);
      }
      settingCreatedForDevice = true;
    }

    if (ussdSchemas) {
      if (ussdSchema) {
        throw new NotAcceptableException(
          null,
          `A ussd schema already exsits for ${ussdSchemas.processor} | ${ussdSchemas.debitOperation}`,
        );
      }

      if (!settingCreatedForDevice) {
        const newSetting = new Setting();
        const date = new Date();
        const newSchema = new UssdSchema();

        newSchema.createdAt = newSchema.updatedAt = date;
        newSchema.debitOperation = ussdSchemas.debitOperation;
        newSchema.processor = ussdSchemas.processor;
        newSchema.ussdCode = ussdSchemas.ussdCodeFormat;
        newSchema.type = ussdSchemas.ussdAction;
        newSchema.setting = newSetting;

        newSetting.updatedAt = newSetting.createdAt = date;
        newSetting.device = device;
        newSetting.user = user;
        // newSetting.schema = [...setting.schema, newSchema];
        await this.setting.save(newSetting);
        await this.ussdSchema.save(newSchema);
      } else {
        const date = new Date();
        const newSchema = new UssdSchema();
        const setting = await this.setting.findOne({ device });

        newSchema.createdAt = newSchema.updatedAt = date;
        newSchema.debitOperation = ussdSchemas.debitOperation;
        newSchema.processor = ussdSchemas.processor;
        newSchema.ussdCode = ussdSchemas.ussdCodeFormat;
        newSchema.type = ussdSchemas.ussdAction;
        newSchema.setting = setting;

        setting.updatedAt = date;
        await this.setting.save(setting);
        await this.ussdSchema.save(newSchema);
      }
    }

    const output = await this.setting.findOne({ device });
    delete output['device'];
    return output;
  }

  async editSettings(user: AdminUser, dataToSave: saveSettingsReq) {
    const { activeDeviceId } = user;
    const { processors, ussdSchemas } = dataToSave;
    const device = await this.device.findOne({ deviceId: activeDeviceId });
    const setting = await this.setting.findOne({ device });

    if (!setting) {
      throw new NotFoundException(null, 'this device does not have a settings');
    }

    if (processors) {
      setting.processors = processors.join('|');
      setting.updatedAt = new Date();
      await this.setting.save(setting);
    }

    if (ussdSchemas) {
      const date = new Date();
      try {
        const ussdSchema = await this.ussdSchema.findOneOrFail({
          id: ussdSchemas.id,
        });

        ussdSchema.debitOperation = ussdSchemas.debitOperation;
        ussdSchema.ussdCode = ussdSchemas.ussdCodeFormat;
        ussdSchema.updatedAt = setting.updatedAt = date;

        await this.ussdSchema.save(ussdSchema);
        await this.setting.save(setting);
      } catch (exp) {
        throw new NotFoundException(null, 'schema does not exsist');
      }
    }

    return await this.setting.findOne({ device });
  }
}

export { UserService };
