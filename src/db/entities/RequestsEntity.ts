import { DebitOperation, MobileOperators } from 'src/lib/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableForeignKey,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './CustomerEntity';

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

  @Column({ type: 'enum', enum: DebitOperation })
  debitOperation: DebitOperation;

  @Column({ type: 'enum', enum: MobileOperators })
  processor: MobileOperators;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
