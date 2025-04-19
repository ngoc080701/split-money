import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Bill } from './bill.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'bill_users' })
export class BillUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Bill User ID' })
  id: number;

  @Column({ name: 'bill_id' })
  @ApiProperty({ description: 'Bill ID' })
  billId: number;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'User ID' })
  userId: number;

  @Column({
    name: 'paid_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    comment: 'Positive if user paid more than average, negative if less',
  })
  @ApiProperty({
    description: 'Paid amount (positive if paid more than average, negative if less)',
  })
  paidAmount: number;

  @ManyToOne(() => Bill, (bill) => bill.billUsers)
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}