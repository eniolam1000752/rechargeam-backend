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
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.requests)
  customer: Customer;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @Column({ type: 'enum', enum: RequestType, default: RequestType.AIRTIME })
  type: RequestType;

  @Column({ type: 'int', default: 0 })
  amount: number;

  // @CreateDateColumn()
  // createDate: Date;

  // @UpdateDateColumn()
  // updateDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
