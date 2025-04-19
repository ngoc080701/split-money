import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BillUser } from './bill-user.entity';
import { Transaction } from './transaction.entity';

@Entity({ name: 'bills' })
export class Bill extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Bill ID' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Bill name' })
  name: string;

  @Column({ name: 'group_id' })
  @ApiProperty({ description: 'Group ID' })
  groupId: number;

  @Column({ name: 'created_by' })
  @ApiProperty({ description: 'User ID of bill creator' })
  createdBy: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Total amount of the bill' })
  totalAmount: number;

  @Column({ name: 'avg_amount', type: 'decimal', precision: 12, scale: 2 })
  @ApiProperty({ description: 'Average amount per person' })
  avgAmount: number;

  @ManyToOne(() => Group, (group) => group.id)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => BillUser, (billUser) => billUser.bill)
  billUsers: BillUser[];

  @OneToMany(() => Transaction, (transaction) => transaction.bill)
  transactions: Transaction[];
}