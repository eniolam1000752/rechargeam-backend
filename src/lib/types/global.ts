import { adminClass } from 'src/db/entities/AdminUserEntity';

export interface IUntokenized {
  userId: string;
  deviceId: string;
  userType: adminClass;
  createdTime: Date;
}
