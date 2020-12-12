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

  @CreateDateColumn()
  createDate: Date;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.devices)
  user: AdminUser;

  @UpdateDateColumn()
  updateDate: Date;
}
