import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'Group name', example: 'Family Group' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;
}
