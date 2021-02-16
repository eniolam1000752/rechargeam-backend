import { MobileOperators } from 'src/lib/constants';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum PlanType {
  RESELLER = 'RESELLER',
  CUSTOMER = 'CUSTOMER',
}

@Entity()
export class DataPlans {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dataAmount: string;

  @Column({ enum: MobileOperators, type: 'enum' })
  mobileOperator: MobileOperators;

  @Column({ enum: PlanType, type: 'enum' })
  planType: PlanType;
}
