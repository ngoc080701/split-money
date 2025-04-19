import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Bill } from './bill.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'transactions' })
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Transaction ID' })
  id: number;

  @Column({ name: 'bill_id' })
  @ApiProperty({ description: 'Bill ID' })
  billId: number;

  @Column({ name: 'from_user_id' })
  @ApiProperty({ description: 'User ID who owes money' })
  fromUserId: number;

  @Column({ name: 'to_user_id' })
  @ApiProperty({ description: 'User ID who receives money' })
  toUserId: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  @ApiProperty({ description: 'Amount to be paid' })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @ApiProperty({
    description: 'Transaction status',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ManyToOne(() => Bill, (bill) => bill.transactions)
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'to_user_id' })
  toUser: User;
}