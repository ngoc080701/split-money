import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateGroupsTable1743955097300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'groups',
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
            length: '100',
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
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'group_members',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'groupId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'int',
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
      true,
    );

    await queryRunner.createForeignKey(
      'group_members',
      new TableForeignKey({
        columnNames: ['groupId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'groups',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'group_members',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const groupMembersTable = await queryRunner.getTable('group_members');
    if (groupMembersTable) {
      const groupForeignKey = groupMembersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('groupId') !== -1,
      );
      if (groupForeignKey) {
        await queryRunner.dropForeignKey('group_members', groupForeignKey);
      }

      const userForeignKey = groupMembersTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      if (userForeignKey) {
        await queryRunner.dropForeignKey('group_members', userForeignKey);
      }
    }

    await queryRunner.dropTable('group_members');
    await queryRunner.dropTable('groups');
  }
}
