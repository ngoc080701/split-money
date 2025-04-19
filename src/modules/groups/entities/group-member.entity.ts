import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Group } from './group.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('group_members')
export class GroupMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Group ID' })
  @Column()
  groupId: number;

  @ApiProperty({ description: 'User ID' })
  @Column()
  userId: number;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
