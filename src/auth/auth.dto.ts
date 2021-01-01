import { Interface } from 'readline';
import { adminClass } from 'src/db/entities/AdminUserEntity';
import { MobileOperators } from 'src/lib/constants';

export class PinLoginRequest {
  pin: string;
  deviceId: string;
  username: string;
}

export class AddAdminDto {
  name: string;
  email: string;
  type: adminClass;
}

export interface IRegisterPayload {
  email: string;
  password: string;
  phoneNumber: string;
  otherPhones?: Array<{ phoneNumber: string; processor: MobileOperators }>;
  firstname: string;
  lastname: string;
}
