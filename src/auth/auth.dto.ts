import { adminClass } from 'src/db/entities/AdminUserEntity';

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
