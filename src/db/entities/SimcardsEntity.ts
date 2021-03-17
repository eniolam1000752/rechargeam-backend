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
import { Request } from './RequestsEntity';
import { Setting } from './SettingsEntity';

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
export class SimCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  operatorName: string;

  @Column()
  slotIndex: number;

  @Column()
  subscriptionId: number;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.simCards)
  @JoinColumn()
  user: AdminUser;

  @Column({})
  createdAt: Date;

  @Column({})
  updatedAt: Date;
}
