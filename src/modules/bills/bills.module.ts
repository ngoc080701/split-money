import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { Bill } from './entities/bill.entity';
import { BillUser } from './entities/bill-user.entity';
import { Transaction } from './entities/transaction.entity';
import { Group } from '../groups/entities/group.entity';
import { GroupMember } from '../groups/entities/group-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill, BillUser, Transaction, Group, GroupMember]),
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}