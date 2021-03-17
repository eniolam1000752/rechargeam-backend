import { type } from 'os';
import { join } from 'path';
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

enum DebitOperation {
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
  processor: MobileOperators;

  @Column()
  ussdCode: string;

  @Column({ type: 'enum', enum: DebitOperation })
  debitOperation: DebitOperation;

  @Column({ type: 'enum', enum: USSDSchemaAction })
  type: USSDSchemaAction;

  @ManyToOne(() => Setting, (setting) => setting.schema)
  @JoinColumn()
  setting: Setting;

  @Column({
    type: 'timestamp',
  })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;
}
