import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class AssignUsersToBillDto {
  @ApiProperty({ description: 'List of user IDs to assign to the bill', type: [Number] })
  @IsArray()
  @IsNotEmpty()
  userIds: number[];
}