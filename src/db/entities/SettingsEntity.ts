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
import { Request } from './RequestsEntity';
import { SimCard } from './SimcardsEntity';
import { UssdSchema } from './UssdSchemaEntity';

enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

enum RequestType {
  DATA = 'DATA',
  AIRTIME = 'AIRTIME',
}
@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => SimCard, (simCard) => simCard.setting)
  @JoinColumn()
  airtimeSim: SimCard;

  @OneToOne(() => SimCard, (simCard) => simCard.setting)
  @JoinColumn()
  dataSim: SimCard;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.setting)
  @JoinColumn()
  user: AdminUser;

  @OneToOne(() => Devices, (devices) => devices.setting)
  @JoinColumn()
  device: Devices;

  @OneToMany(() => UssdSchema, (ussdSchema) => ussdSchema.setting)
  schema: UssdSchema;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
