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

  @OneToOne(() => Setting, (setting) => setting.dataSim)
  @JoinColumn()
  setting: Setting;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.simCards)
  @JoinColumn()
  user: AdminUser;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date; 

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
