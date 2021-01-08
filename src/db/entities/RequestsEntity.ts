import { DebitOperation, MobileOperators } from 'src/lib/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  TableForeignKey,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUser } from './AdminUserEntity';
import { Customer } from './CustomerEntity';
import { Devices } from './DevicesEntity';

export enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SENT = 'SENT',
}
@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.requests, { eager: true })
  customer: Customer;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @Column({ type: 'varchar', default: 0 })
  amount: string;

  @Column({ type: 'varchar' })
  phoneNumber: string;

  @Column({ type: 'varchar' })
  ref: string;

  @Column({ type: 'enum', enum: DebitOperation })
  debitOperation: DebitOperation;

  @Column({ type: 'enum', enum: MobileOperators })
  processor: MobileOperators;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser.requests)
  @JoinColumn()
  admin: AdminUser;

  @ManyToOne(() => Devices, (device) => device.request)
  @JoinColumn()
  device: Devices;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
