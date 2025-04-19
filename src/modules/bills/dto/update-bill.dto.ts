import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BillUserDto } from './create-bill.dto';

export class UpdateBillDto {
  @ApiProperty({ description: 'Bill name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Total amount of the bill' })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({
    description: 'Users and their paid amounts',
    type: [BillUserDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillUserDto)
  @IsOptional()
  users?: BillUserDto[];
}
