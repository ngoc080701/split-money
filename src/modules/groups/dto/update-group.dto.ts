import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateGroupDto {
  @ApiProperty({ description: 'Group name', example: 'Updated Group Name' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;
}
