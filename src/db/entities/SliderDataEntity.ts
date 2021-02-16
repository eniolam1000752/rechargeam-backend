import { MobileOperators } from 'src/lib/constants';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum PlanType {
  RESELLER = 'RESELLER',
  CUSTOMER = 'CUSTOMER',
}

@Entity()
export class SliderData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  createdDate: Date;

  @Column()
  updatedDate: Date;
}
