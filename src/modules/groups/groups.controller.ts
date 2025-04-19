import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({
    status: 201,
    description: 'The group has been successfully created.',
    type: Group,
  })
  create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    return this.groupsService.create(createGroupDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({
    status: 200,
    description: 'Return all groups',
    type: [Group],
  })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group by id' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the group with the specified id',
    type: Group,
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'The group has been successfully updated.',
    type: Group,
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'The group has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }

  @Post(':groupId/members')
  @ApiOperation({ summary: 'Add a member to a group' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 201,
    description: 'The member has been successfully added to the group.',
    type: GroupMember,
  })
  @ApiResponse({ status: 404, description: 'Group or user not found' })
  addMember(
    @Param('groupId') groupId: string,
    @Body() addGroupMemberDto: AddGroupMemberDto,
  ) {
    return this.groupsService.addMember(+groupId, addGroupMemberDto);
  }

  @Get(':groupId/members')
  @ApiOperation({ summary: 'Get all members of a group' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all members of the group',
    type: [GroupMember],
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findAllMembers(@Param('groupId') groupId: string) {
    return this.groupsService.findAllMembers(+groupId);
  }

  @Delete(':groupId/members/:memberId')
  @ApiOperation({ summary: 'Remove a member from a group' })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiParam({ name: 'memberId', description: 'Group Member ID' })
  @ApiResponse({
    status: 200,
    description: 'The member has been successfully removed from the group.',
  })
  @ApiResponse({ status: 404, description: 'Group or member not found' })
  removeMember(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.groupsService.removeMember(+groupId, +memberId);
  }
}
