import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { GroupMember } from './group-member.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('groups')
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Group name' })
  @Column({ length: 100 })
  name: string;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];
}
