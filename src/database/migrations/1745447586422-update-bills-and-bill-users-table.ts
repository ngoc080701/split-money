import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateBillsAndBillUsersTable1745447586422
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename avg_amount to per_amount in bills table
    await queryRunner.renameColumn('bills', 'avg_amount', 'per_amount');

    // Add debt_amount column to bill_users table
    await queryRunner.addColumn(
      'bill_users',
      new TableColumn({
        name: 'debt_amount',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
        isNullable: false,
        comment: 'How much the user owes (positive when perAmount is positive)',
      }),
    );

    // Add surplus_amount column to bill_users table
    await queryRunner.addColumn(
      'bill_users',
      new TableColumn({
        name: 'surplus_amount',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
        isNullable: false,
        comment:
          'How much the user is owed (positive when perAmount is negative)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove debt_amount and surplus_amount columns from bill_users table
    await queryRunner.dropColumn('bill_users', 'debt_amount');
    await queryRunner.dropColumn('bill_users', 'surplus_amount');

    // Rename per_amount back to avg_amount in bills table
    await queryRunner.renameColumn('bills', 'per_amount', 'avg_amount');
  }
}
