import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: number): Promise<Group> {
    // Kiểm tra xem user có tồn tại không
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Tạo nhóm mới
    const group = this.groupRepository.create(createGroupDto);
    const savedGroup = await this.groupRepository.save(group);

    // Tự động thêm người tạo vào nhóm
    const groupMember = this.groupMemberRepository.create({
      groupId: savedGroup.id,
      userId: userId,
    });
    await this.groupMemberRepository.save(groupMember);

    return this.findOne(savedGroup.id);
  }

  async findAll(): Promise<Group[]> {
    return this.groupRepository.find({
      relations: ['members', 'members.user'],
    });
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    this.groupRepository.merge(group, updateGroupDto);
    return this.groupRepository.save(group);
  }

  async remove(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.groupRepository.softRemove(group);
  }

  async addMember(
    groupId: number,
    addGroupMemberDto: AddGroupMemberDto,
  ): Promise<GroupMember> {
    const { userId } = addGroupMemberDto;

    // Check if group exists
    const group = await this.groupRepository.findOneBy({ id: groupId });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if user exists
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user is already a member of the group
    const existingMember = await this.groupMemberRepository.findOne({
      where: { groupId, userId },
    });

    if (existingMember) {
      throw new ConflictException(
        `User with ID ${userId} is already a member of this group`,
      );
    }

    // Create new group member
    const groupMember = this.groupMemberRepository.create({
      groupId,
      userId,
    });

    return this.groupMemberRepository.save(groupMember);
  }

  async findAllMembers(groupId: number): Promise<GroupMember[]> {
    // Check if group exists
    const group = await this.groupRepository.findOneBy({ id: groupId });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.groupMemberRepository.find({
      where: { groupId },
      relations: ['user'],
    });
  }

  async removeMember(groupId: number, memberId: number): Promise<void> {
    // Check if group exists
    const group = await this.groupRepository.findOneBy({ id: groupId });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if member exists
    const member = await this.groupMemberRepository.findOne({
      where: { id: memberId, groupId },
    });

    if (!member) {
      throw new NotFoundException(
        `Member with ID ${memberId} not found in group with ID ${groupId}`,
      );
    }

    await this.groupMemberRepository.softRemove(member);
  }
}
