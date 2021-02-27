import { MobileOperators } from 'src/lib/constants';
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
export class Referrals {
  constructor(data?: Referrals) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }
  @PrimaryGeneratedColumn()
  id?: number;

  @OneToOne(() => Customer, (cust) => cust.referral)
  @JoinColumn()
  customer?: Customer;

  @ManyToOne(() => Customer, (cust) => cust.referrees)
  @JoinColumn()
  referrer?: Customer;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt?: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt?: Date;
}
