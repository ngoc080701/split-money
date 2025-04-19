import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { BillUser } from './entities/bill-user.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { AssignUsersToBillDto } from './dto/assign-users-to-bill.dto';
import { TransactionStatus } from './enums/transaction-status.enum';
import { Group } from '../groups/entities/group.entity';
import { GroupMember } from '../groups/entities/group-member.entity';

@Injectable()
export class BillsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Bill)
    private billsRepository: Repository<Bill>,
    @InjectRepository(BillUser)
    private billUsersRepository: Repository<BillUser>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private groupMembersRepository: Repository<GroupMember>,
  ) {}

  async create(createBillDto: CreateBillDto, userId: number): Promise<Bill> {
    // Start a transaction since we need to create multiple records
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if group exists and user is a member
      const group = await this.groupsRepository.findOne({
        where: { id: createBillDto.groupId },
      });

      if (!group) {
        throw new NotFoundException(`Group with ID ${createBillDto.groupId} not found`);
      }

      const isMember = await this.groupMembersRepository.findOne({
        where: { groupId: createBillDto.groupId, userId },
      });

      if (!isMember) {
        throw new ForbiddenException(`User is not a member of the group`);
      }

      // Create the bill
      const bill = this.billsRepository.create({
        name: createBillDto.name,
        groupId: createBillDto.groupId,
        createdBy: userId,
        totalAmount: createBillDto.totalAmount,
        avgAmount: createBillDto.totalAmount, // Default to total amount, will be updated later
      });
      
      // Save the bill
      const savedBill = await queryRunner.manager.save(bill);

      // Create initial BillUser entry for the creator with 0 paid amount
      const creatorBillUser = new BillUser();
      creatorBillUser.billId = savedBill.id;
      creatorBillUser.userId = userId;
      creatorBillUser.paidAmount = 0; // Initially set to 0, will be updated when assigning users

      await queryRunner.manager.save(BillUser, creatorBillUser);

      await queryRunner.commitTransaction();
      
      return this.findOne(savedBill.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async assignUsersToBill(billId: number, assignUsersDto: AssignUsersToBillDto, userId: number): Promise<Bill> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the bill
      const bill = await this.billsRepository.findOne({
        where: { id: billId },
      });

      if (!bill) {
        throw new NotFoundException(`Bill with ID ${billId} not found`);
      }

      // Check if the user is the bill creator
      if (bill.createdBy !== userId) {
        throw new ForbiddenException('Only the bill creator can assign users');
      }

      // Check if all users are members of the group
      const groupMembers = await this.groupMembersRepository.find({
        where: { groupId: bill.groupId },
      });
      
      const groupMemberIds = groupMembers.map(member => member.userId);
      
      // Verify all assigned users are in the group
      const allUsersInGroup = assignUsersDto.userIds.every(userId => 
        groupMemberIds.includes(userId)
      );
      
      if (!allUsersInGroup) {
        throw new BadRequestException('Not all users are members of the group');
      }

      // Get existing bill users
      const existingBillUsers = await this.billUsersRepository.find({
        where: { billId },
      });

      const existingUserIds = existingBillUsers.map(bu => bu.userId);

      // Prevent duplicate assignments
      const newUserIds = assignUsersDto.userIds.filter(id => !existingUserIds.includes(id));

      if (newUserIds.length === 0) {
        throw new BadRequestException('All users are already assigned to the bill');
      }

      // Create new bill users
      const newBillUsers = newUserIds.map(userId => {
        const billUser = new BillUser();
        billUser.billId = billId;
        billUser.userId = userId;
        billUser.paidAmount = 0; // Initially set to 0
        return billUser;
      });

      await queryRunner.manager.save(BillUser, newBillUsers);

      // Recalculate average amount based on total number of users
      const totalUsers = existingBillUsers.length + newBillUsers.length;
      bill.avgAmount = bill.totalAmount / totalUsers;

      // Update existing bill users with new average
      for (const billUser of existingBillUsers) {
        billUser.paidAmount = billUser.paidAmount - bill.avgAmount;
        await queryRunner.manager.save(BillUser, billUser);
      }

      // Update the bill with new average
      await queryRunner.manager.save(bill);

      await queryRunner.commitTransaction();
      
      return this.findOne(billId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private generateTransactions(billId: number, billUsers: BillUser[]): Transaction[] {
    // Separate users who paid more (creditors) and users who paid less (debtors)
    const creditors = billUsers
      .filter(user => user.paidAmount > 0)
      .sort((a, b) => b.paidAmount - a.paidAmount); // Sort by highest credit first
    
    const debtors = billUsers
      .filter(user => user.paidAmount < 0)
      .sort((a, b) => a.paidAmount - b.paidAmount); // Sort by highest debt first (most negative)
    
    const transactions: Transaction[] = [];

    // For each debtor, create transactions with creditors
    debtors.forEach(debtor => {
      let remainingDebt = Math.abs(debtor.paidAmount);
      let creditorIndex = 0;
      
      while (remainingDebt > 0 && creditorIndex < creditors.length) {
        const creditor = creditors[creditorIndex];
        const availableCredit = creditor.paidAmount;
        
        if (availableCredit <= 0) {
          creditorIndex++;
          continue;
        }
        
        // Calculate transaction amount
        const transactionAmount = Math.min(remainingDebt, availableCredit);
        
        // Create a transaction
        const transaction = new Transaction();
        transaction.billId = billId;
        transaction.fromUserId = debtor.userId; // Debtor pays
        transaction.toUserId = creditor.userId; // Creditor receives
        transaction.amount = transactionAmount;
        transaction.status = TransactionStatus.PENDING;
        
        transactions.push(transaction);
        
        // Update remaining amounts
        remainingDebt -= transactionAmount;
        creditor.paidAmount -= transactionAmount;
        
        // Move to next creditor if this one is fully used
        if (creditor.paidAmount <= 0) {
          creditorIndex++;
        }
      }
    });
    
    return transactions;
  }

  async updateBillUsers(billId: number, createBillDto: CreateBillDto, userId: number): Promise<Bill> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the bill
      const bill = await this.billsRepository.findOne({
        where: { id: billId },
      });

      if (!bill) {
        throw new NotFoundException(`Bill with ID ${billId} not found`);
      }

      // Check if the user is the bill creator
      if (bill.createdBy !== userId) {
        throw new ForbiddenException('Only the bill creator can update bill users');
      }

      // Delete existing bill users and transactions
      await queryRunner.manager.delete(Transaction, { billId });
      await queryRunner.manager.delete(BillUser, { billId });

      // Update bill total amount if provided
      if (createBillDto.totalAmount) {
        bill.totalAmount = createBillDto.totalAmount;
      }

      // Calculate new average amount
      bill.avgAmount = bill.totalAmount / createBillDto.users.length;
      
      // Save updated bill
      await queryRunner.manager.save(bill);

      // Create new bill users
      const billUsers = createBillDto.users.map(user => {
        const billUser = new BillUser();
        billUser.billId = billId;
        billUser.userId = user.userId;
        billUser.paidAmount = user.paidAmount - bill.avgAmount; // Calculate difference from average
        return billUser;
      });

      await queryRunner.manager.save(BillUser, billUsers);

      // Generate transactions
      const transactions = this.generateTransactions(billId, billUsers);
      
      if (transactions.length > 0) {
        await queryRunner.manager.save(Transaction, transactions);
      }

      await queryRunner.commitTransaction();
      
      return this.findOne(billId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Bill[]> {
    return this.billsRepository.find({
      relations: ['group', 'creator'],
    });
  }

  async findByGroup(groupId: number): Promise<Bill[]> {
    return this.billsRepository.find({
      where: { groupId },
      relations: ['group', 'creator'],
    });
  }

  async findOne(id: number): Promise<Bill> {
    const bill = await this.billsRepository.findOne({
      where: { id },
      relations: ['group', 'creator', 'billUsers', 'billUsers.user', 'transactions', 'transactions.fromUser', 'transactions.toUser'],
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    return bill;
  }

  async update(id: number, updateBillDto: UpdateBillDto, userId: number): Promise<Bill> {
    const bill = await this.billsRepository.findOne({
      where: { id },
      relations: ['billUsers'],
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    // Only the creator can update the bill
    if (bill.createdBy !== userId) {
      throw new ForbiddenException('Only the bill creator can update the bill');
    }

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update bill fields
      if (updateBillDto.name) {
        bill.name = updateBillDto.name;
      }

      if (updateBillDto.totalAmount) {
        bill.totalAmount = updateBillDto.totalAmount;
        
        // Recalculate the average if total amount changes
        if (updateBillDto.users) {
          bill.avgAmount = updateBillDto.totalAmount / updateBillDto.users.length;
        } else if (bill.billUsers && bill.billUsers.length > 0) {
          bill.avgAmount = updateBillDto.totalAmount / bill.billUsers.length;
        }
      }

      // Save the updated bill
      await queryRunner.manager.save(bill);

      // If users array is provided, update the bill users
      if (updateBillDto.users) {
        // Delete existing bill users and transactions
        await queryRunner.manager.delete(Transaction, { billId: id });
        await queryRunner.manager.delete(BillUser, { billId: id });

        // Create new bill users
        const billUsers = updateBillDto.users.map(user => {
          const billUser = new BillUser();
          billUser.billId = id;
          billUser.userId = user.userId;
          billUser.paidAmount = user.paidAmount - bill.avgAmount;
          return billUser;
        });

        await queryRunner.manager.save(BillUser, billUsers);

        // Generate new transactions
        const transactions = this.generateTransactions(id, billUsers);
        
        if (transactions.length > 0) {
          await queryRunner.manager.save(Transaction, transactions);
        }
      }

      await queryRunner.commitTransaction();
      
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    const bill = await this.billsRepository.findOne({
      where: { id },
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    // Only the creator can delete the bill
    if (bill.createdBy !== userId) {
      throw new ForbiddenException('Only the bill creator can delete the bill');
    }

    await this.billsRepository.softDelete(id);
  }

  async findBillUsers(billId: number): Promise<BillUser[]> {
    const bill = await this.billsRepository.findOne({
      where: { id: billId },
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${billId} not found`);
    }

    return this.billUsersRepository.find({
      where: { billId },
      relations: ['user'],
    });
  }

  async findBillTransactions(billId: number): Promise<Transaction[]> {
    const bill = await this.billsRepository.findOne({
      where: { id: billId },
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${billId} not found`);
    }

    return this.transactionsRepository.find({
      where: { billId },
      relations: ['fromUser', 'toUser'],
    });
  }

  async updateTransactionStatus(
    id: number, 
    updateStatusDto: UpdateTransactionStatusDto, 
    userId: number
  ): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['fromUser', 'toUser'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Validate that the user has permission to update this transaction
    if (updateStatusDto.status === TransactionStatus.PROCESSING) {
      // For PROCESSING, the fromUser (debtor) must be making the request
      if (transaction.fromUserId !== userId) {
        throw new ForbiddenException('Only the payer can mark a transaction as processing');
      }
      
      // Can only transition from PENDING to PROCESSING
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('Transaction can only be marked as processing when it is pending');
      }
    } else if (updateStatusDto.status === TransactionStatus.DONE) {
      // For DONE, the toUser (creditor) must be making the request
      if (transaction.toUserId !== userId) {
        throw new ForbiddenException('Only the receiver can mark a transaction as done');
      }
      
      // Can only transition from PROCESSING to DONE
      if (transaction.status !== TransactionStatus.PROCESSING) {
        throw new BadRequestException('Transaction can only be marked as done when it is processing');
      }
    } else {
      throw new BadRequestException('Invalid status transition');
    }

    // Update the status
    transaction.status = updateStatusDto.status;
    return this.transactionsRepository.save(transaction);
  }

  async getUserBills(userId: number): Promise<Bill[]> {
    const billUsers = await this.billUsersRepository.find({
      where: { userId },
      relations: ['bill', 'bill.group', 'bill.creator'],
    });
    
    return billUsers.map(billUser => billUser.bill);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: [
        { fromUserId: userId },
        { toUserId: userId },
      ],
      relations: ['bill', 'fromUser', 'toUser'],
    });
  }
}