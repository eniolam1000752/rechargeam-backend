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
import { Setting } from './SettingsEntity';
import { SimCard } from './SimcardsEntity';

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

  @OneToOne(() => Devices, (device) => device.user, { eager: true })
  @JoinColumn()
  aDevice: Devices;

  @Column({ type: 'enum', enum: adminClass })
  type: adminClass;

  @OneToMany(() => Devices, (device) => device.user, { eager: true })
  @JoinColumn()
  devices: Devices[];

  @OneToMany(() => Setting, (setting) => setting.user, { eager: true })
  @JoinColumn()
  setting: Array<Setting>;

  @OneToMany(() => SimCard, (simCard) => simCard.user, { eager: true })
  @JoinColumn()
  simCards: SimCard;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
