import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTransactionsTable1743955097420 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create transactions table
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'bill_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'from_user_id',
            type: 'int',
            isNullable: false,
            comment: 'User who owes money',
          },
          {
            name: 'to_user_id',
            type: 'int',
            isNullable: false,
            comment: 'User who receives money',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
            comment: 'Amount to be paid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'PROCESSING', 'DONE'],
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    // Add indexes
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'idx_transactions_bill_id',
        columnNames: ['bill_id'],
      }),
    );

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'idx_transactions_from_user_id',
        columnNames: ['from_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'idx_transactions_to_user_id',
        columnNames: ['to_user_id'],
      }),
    );

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'idx_transactions_status',
        columnNames: ['status'],
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'fk_transactions_bill_id',
        columnNames: ['bill_id'],
        referencedTableName: 'bills',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'fk_transactions_from_user_id',
        columnNames: ['from_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'fk_transactions_to_user_id',
        columnNames: ['to_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('transactions', 'fk_transactions_to_user_id');
    await queryRunner.dropForeignKey('transactions', 'fk_transactions_from_user_id');
    await queryRunner.dropForeignKey('transactions', 'fk_transactions_bill_id');
    
    // Drop indexes
    await queryRunner.dropIndex('transactions', 'idx_transactions_status');
    await queryRunner.dropIndex('transactions', 'idx_transactions_to_user_id');
    await queryRunner.dropIndex('transactions', 'idx_transactions_from_user_id');
    await queryRunner.dropIndex('transactions', 'idx_transactions_bill_id');
    
    // Drop the transactions table
    await queryRunner.dropTable('transactions');
  }
}