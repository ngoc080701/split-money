import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransactionStatus } from '../enums/transaction-status.enum';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    description: 'New transaction status',
    enum: TransactionStatus,
  })
  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;
}