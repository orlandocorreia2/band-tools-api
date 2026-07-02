import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBandsTable1780368748378 implements MigrationInterface {
  private readonly tableName = 'bands';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'genre',
            type: 'varchar',
            isNullable: false,
            default: "'Heavy Metal'",
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'neighborhood',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            default: "'active'",
          },
          {
            name: 'image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName, true);
  }
}
