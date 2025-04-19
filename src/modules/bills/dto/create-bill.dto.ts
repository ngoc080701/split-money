import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BillUserDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Amount paid by user' })
  @IsNumber()
  @IsNotEmpty()
  paidAmount: number;
}

export class CreateBillDto {
  @ApiProperty({ description: 'Bill name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Group ID' })
  @IsNumber()
  @IsNotEmpty()
  groupId: number;

  @ApiProperty({ description: 'Total amount of the bill' })
  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty({ description: 'Users and their paid amounts', type: [BillUserDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillUserDto)
  users: BillUserDto[];
}