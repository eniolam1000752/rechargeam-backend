import { type } from 'os';
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
import { AdminUser } from './AdminUserEntity';
import { Request } from './RequestsEntity';
import { Setting } from './SettingsEntity';

enum DebitOperations {
  AIRTIME = 'AIRTIME',
  DATA = 'DATA',
}

enum MobileOperators {
  DATA = 'MTN',
  _9MOBILE = '9MOBILE',
  GLO = 'GLO',
  AIRTEL = 'AIRTEL',
}

enum USSDSchemaAction {
  BALANCE = 'BALANCE',
  DEBIT = 'DEBIT',
}

@Entity()
export class UssdSchema {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MobileOperators })
  mobileOperator: MobileOperators;

  @Column()
  ussdCode: string;1

  @Column({ type: 'enum', enum: DebitOperations })
  debitOperation: DebitOperations;

  @Column({ type: 'enum', enum: USSDSchemaAction })
  type: USSDSchemaAction;

  @ManyToOne(() => Setting, (setting) => setting.schema)
  setting: Setting;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;
}
