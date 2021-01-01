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

@Entity()
export class Devices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deviceModel: string;

  @Column()
  deviceId: string;

  @Column()
  pushToken: string;

  @Column()
  isActive: boolean;

  @OneToOne(() => Setting, (setting) => setting.device, { eager: true })
  @JoinColumn()
  setting: Setting;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.devices)
  @JoinColumn()
  user: AdminUser;

  @OneToMany(() => Request, (request) => request.device, { eager: true })
  @JoinColumn()
  request: Request[];

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
