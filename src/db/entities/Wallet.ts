import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminUser } from './AdminUserEntity';
import { Customer } from './CustomerEntity';
import { Devices } from './DevicesEntity';
import { UssdSchema } from './UssdSchemaEntity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  amount: number;

  @Column({ default: 0 })
  commission: number;

  @OneToOne(() => Customer, (cust) => cust.wallet)
  @JoinColumn()
  customer: Customer;

  @Column({ type: 'timestamp', nullable: true, default: null })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
