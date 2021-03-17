import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUser } from './AdminUserEntity';
import { Devices } from './DevicesEntity';
import { UssdSchema } from './UssdSchemaEntity';

enum Processors {
  MTN = 'MTN',
  GLO = 'GLO',
  MOBILE = '9MOBILE',
  AIRTEL = 'AIRTEL',
}
@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  processors: string;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.setting)
  @JoinColumn()
  user: AdminUser;

  @OneToOne(() => Devices, (devices) => devices.setting)
  @JoinColumn()
  device: Devices;

  @OneToMany(() => UssdSchema, (ussdSchema) => ussdSchema.setting, {
    eager: true,
  })
  schema: UssdSchema[];

  @Column({
    type: 'timestamp',
  })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}
