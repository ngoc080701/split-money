import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBillUsersTable1743955097410 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Bill Users table
    await queryRunner.createTable(
      new Table({
        name: 'bill_users',
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
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'paid_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
            comment: 'Positive if user paid more than average, negative if less',
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
      'bill_users',
      new TableIndex({
        name: 'idx_bill_users_bill_id',
        columnNames: ['bill_id'],
      }),
    );

    await queryRunner.createIndex(
      'bill_users',
      new TableIndex({
        name: 'idx_bill_users_user_id',
        columnNames: ['user_id'],
      }),
    );

    // Create a unique constraint for bill_id and user_id
    await queryRunner.createIndex(
      'bill_users',
      new TableIndex({
        name: 'idx_bill_users_unique',
        columnNames: ['bill_id', 'user_id'],
        isUnique: true,
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'bill_users',
      new TableForeignKey({
        name: 'fk_bill_users_bill_id',
        columnNames: ['bill_id'],
        referencedTableName: 'bills',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bill_users',
      new TableForeignKey({
        name: 'fk_bill_users_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('bill_users', 'fk_bill_users_user_id');
    await queryRunner.dropForeignKey('bill_users', 'fk_bill_users_bill_id');
    
    // Drop indexes
    await queryRunner.dropIndex('bill_users', 'idx_bill_users_unique');
    await queryRunner.dropIndex('bill_users', 'idx_bill_users_user_id');
    await queryRunner.dropIndex('bill_users', 'idx_bill_users_bill_id');
    
    // Drop the bill_users table
    await queryRunner.dropTable('bill_users');
  }
}