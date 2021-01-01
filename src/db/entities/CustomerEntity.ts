import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerPhoneNumbers } from './CustomerPhoneNumbersEntity';
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
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column()
  isActive: boolean;

  @Column()
  phoneNumber: string;

  @OneToMany(() => Request, (request) => request.customer)
  @JoinColumn()
  requests: Request[];

  @OneToMany(
    () => CustomerPhoneNumbers,
    (custPhoneNumbers) => custPhoneNumbers.customer,
  )
  @JoinColumn()
  otherPhones: CustomerPhoneNumbers[];

  @Column()
  token: string;

  @Column()
  profileImage: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
