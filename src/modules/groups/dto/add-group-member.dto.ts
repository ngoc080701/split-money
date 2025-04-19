import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddGroupMemberDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsInt()
  @IsPositive()
  userId: number;
}
