import { Column, Entity } from 'typeorm';

@Entity()
export class AdminUserEntity {
  @Column()
  id: string;
}
