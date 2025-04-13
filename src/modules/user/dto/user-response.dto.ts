import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: '2023-07-21T12:00:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2023-07-21T12:00:00.000Z' })
  updatedAt: Date;
}
