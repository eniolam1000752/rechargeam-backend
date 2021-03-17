import { MobileOperators } from 'src/lib/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './CustomerEntity';
import { Request } from './RequestsEntity';

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
export class CustomerPhoneNumbers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;

  @Column({ type: 'enum', enum: MobileOperators })
  processor: MobileOperators;

  @ManyToOne(() => Customer, (cust) => cust.otherPhones)
  @JoinColumn()
  customer: Customer;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}
