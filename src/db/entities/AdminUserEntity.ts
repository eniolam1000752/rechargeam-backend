import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Devices } from './DevicesEntity';

export enum adminClass {
  SUPER = 'SUPER',
  SUB = 'SUB',
}
@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  pin: string;

  @Column({ type: 'boolean' })
  isActive: boolean;

  @Column()
  token: string;

  @Column()
  activeDeviceId: string;

  @Column({ type: 'enum', enum: adminClass })
  type: adminClass;

  @OneToMany(() => Devices, (device) => device.user)
  @JoinColumn()
  devices: Devices[];

  // @UpdateDateColumn()
  // updateDate: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true, default: null })
  created_at: Date;
}
