import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUser } from './AdminUserEntity';
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

  // @OneToOne(() => AdminUser, (adminUser) => adminUser.activeDevice)
  // @JoinColumn()
  // userTemp: AdminUser;


  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
