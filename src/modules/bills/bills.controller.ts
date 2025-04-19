import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { AssignUsersToBillDto } from './dto/assign-users-to-bill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Bill } from './entities/bill.entity';
import { BillUser } from './entities/bill-user.entity';
import { Transaction } from './entities/transaction.entity';

@ApiTags('bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bill' })
  @ApiResponse({
    status: 201,
    description: 'The bill has been successfully created.',
    type: Bill,
  })
  create(@Body() createBillDto: CreateBillDto, @Request() req) {
    return this.billsService.create(createBillDto, req.user.id);
  }

  @Post(':id/assign-users')
  @ApiOperation({ summary: 'Assign group members to a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'Users have been successfully assigned to the bill.',
    type: Bill,
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to assign users to this bill' })
  assignUsersToBill(
    @Param('id') id: string,
    @Body() assignUsersDto: AssignUsersToBillDto,
    @Request() req,
  ) {
    return this.billsService.assignUsersToBill(+id, assignUsersDto, req.user.id);
  }

  @Post(':id/users')
  @ApiOperation({ summary: 'Update bill users and their paid amounts' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'Bill users have been successfully updated.',
    type: Bill,
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to update this bill' })
  updateBillUsers(
    @Param('id') id: string,
    @Body() createBillDto: CreateBillDto,
    @Request() req,
  ) {
    return this.billsService.updateBillUsers(+id, createBillDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bills or by group ID' })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'Filter bills by group ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all bills or bills for a specific group',
    type: [Bill],
  })
  findAll(@Query('groupId') groupId?: string) {
    if (groupId) {
      return this.billsService.findByGroup(+groupId);
    }
    return this.billsService.findAll();
  }

  @Get('my-bills')
  @ApiOperation({ summary: 'Get all bills for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all bills for the current user',
    type: [Bill],
  })
  findMyBills(@Request() req) {
    return this.billsService.getUserBills(req.user.id);
  }

  @Get('my-transactions')
  @ApiOperation({ summary: 'Get all transactions for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all transactions for the current user',
    type: [Transaction],
  })
  findMyTransactions(@Request() req) {
    return this.billsService.getUserTransactions(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bill by id' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the bill with the specified id',
    type: Bill,
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'The bill has been successfully updated.',
    type: Bill,
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  update(
    @Param('id') id: string,
    @Body() updateBillDto: UpdateBillDto,
    @Request() req,
  ) {
    return this.billsService.update(+id, updateBillDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'The bill has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.billsService.remove(+id, req.user.id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get all users of a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all users of the bill',
    type: [BillUser],
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  findBillUsers(@Param('id') id: string) {
    return this.billsService.findBillUsers(+id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get all transactions of a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all transactions of the bill',
    type: [Transaction],
  })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  findBillTransactions(@Param('id') id: string) {
    return this.billsService.findBillTransactions(+id);
  }

  @Put('transactions/:id/status')
  @ApiOperation({ summary: 'Update transaction status' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'The transaction status has been successfully updated.',
    type: Transaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not authorized to update this transaction' })
  updateTransactionStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTransactionStatusDto,
    @Request() req,
  ) {
    return this.billsService.updateTransactionStatus(+id, updateStatusDto, req.user.id);
  }
}