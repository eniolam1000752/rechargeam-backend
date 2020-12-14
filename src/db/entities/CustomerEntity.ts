
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @Column()
  isActive: boolean;

  @Column()
  phoneNumber: string;

  @OneToMany(() => Request, (request) => request.customer)
  @JoinColumn()
  requests: Request[];

  // @CreateDateColumn()
  // createDate: Date;

  // @UpdateDateColumn()
  // updateDate: Date;
}
