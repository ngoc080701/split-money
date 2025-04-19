import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBillsTable1743955097400 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Bills table
    await queryRunner.createTable(
      new Table({
        name: 'bills',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'group_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'avg_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
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
      'bills',
      new TableIndex({
        name: 'idx_bills_group_id',
        columnNames: ['group_id'],
      }),
    );

    await queryRunner.createIndex(
      'bills',
      new TableIndex({
        name: 'idx_bills_created_by',
        columnNames: ['created_by'],
      }),
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'bills',
      new TableForeignKey({
        name: 'fk_bills_group_id',
        columnNames: ['group_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bills',
      new TableForeignKey({
        name: 'fk_bills_created_by',
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('bills', 'fk_bills_created_by');
    await queryRunner.dropForeignKey('bills', 'fk_bills_group_id');
    
    // Drop indexes
    await queryRunner.dropIndex('bills', 'idx_bills_created_by');
    await queryRunner.dropIndex('bills', 'idx_bills_group_id');
    
    // Drop the bills table
    await queryRunner.dropTable('bills');
  }
}