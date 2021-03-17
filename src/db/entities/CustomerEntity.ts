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
import { CustomerPhoneNumbers } from './CustomerPhoneNumbersEntity';
import { Referrals } from './Referrals';
import { Request } from './RequestsEntity';
import { Wallet } from './Wallet';

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
  constructor(data?: Customer) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  username?: string;

  @Column()
  email?: string;

  @Column({ type: 'varchar' })
  password?: string;

  @Column()
  isActive?: boolean;

  @Column()
  phoneNumber?: string;

  @OneToMany(() => Request, (request) => request.customer)
  @JoinColumn()
  requests?: Request[];

  @OneToMany(
    () => CustomerPhoneNumbers,
    (custPhoneNumbers) => custPhoneNumbers.customer,
  )
  @JoinColumn()
  otherPhones?: CustomerPhoneNumbers[];

  @Column()
  token?: string;

  @Column()
  referralUrl?: string;

  @OneToOne(() => Referrals, (r) => r.customer)
  referral?: Referrals;

  @OneToOne(() => Wallet, (r) => r.customer)
  @JoinColumn()
  wallet?: Wallet;

  @OneToMany(() => Referrals, (r) => r.referrer)
  @JoinColumn()
  referrees?: Referrals[];

  @Column()
  profileImage?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt?: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt?: Date;
}
