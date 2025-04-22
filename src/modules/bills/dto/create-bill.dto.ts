import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BillUserDto {
  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Amount paid by user', required: false })
  @IsNumber()
  @IsOptional()
  paidAmount?: number;
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

  @ApiProperty({
    description:
      'Total amount of the bill (required if perAmount is not provided)',
    required: false,
  })
  @IsNumber()
  @ValidateIf((o) => o.perAmount === undefined)
  @IsNotEmpty({ message: 'Either totalAmount or perAmount must be provided' })
  totalAmount?: number;

  @ApiProperty({
    description: 'Amount per person (required if totalAmount is not provided)',
    required: false,
  })
  @IsNumber()
  @ValidateIf((o) => o.totalAmount === undefined)
  @IsNotEmpty({ message: 'Either totalAmount or perAmount must be provided' })
  perAmount?: number;

  @ApiProperty({
    description: 'Users assigned to the bill',
    type: [BillUserDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillUserDto)
  @IsNotEmpty({ message: 'At least one user must be assigned to the bill' })
  users: BillUserDto[];
}
