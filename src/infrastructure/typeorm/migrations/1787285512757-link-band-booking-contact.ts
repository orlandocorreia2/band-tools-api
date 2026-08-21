import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class LinkBandBookingContact1787285512757
  implements MigrationInterface
{
  private readonly tableName = 'band_bookings';
  private readonly referencedTableName = 'user_contacts';
  private readonly foreignKeyName = 'FK_band_bookings_contact_id';
  private readonly indexName = 'IDX_band_bookings_contact_id';
  private readonly droppedColumns = ['focal_point_name', 'phone', 'address'];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.tableName, this.droppedColumns);

    await queryRunner.addColumn(
      this.tableName,
      new TableColumn({
        name: 'contact_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    await queryRunner.createIndex(
      this.tableName,
      new TableIndex({
        name: this.indexName,
        columnNames: ['contact_id'],
      }),
    );

    await queryRunner.createForeignKey(
      this.tableName,
      new TableForeignKey({
        name: this.foreignKeyName,
        columnNames: ['contact_id'],
        referencedTableName: this.referencedTableName,
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.tableName, this.foreignKeyName);
    await queryRunner.dropIndex(this.tableName, this.indexName);
    await queryRunner.dropColumn(this.tableName, 'contact_id');

    await queryRunner.addColumns(
      this.tableName,
      this.droppedColumns.map(
        (name) =>
          new TableColumn({
            name,
            type: 'varchar',
            length: name === 'phone' ? '11' : undefined,
            isNullable: true,
          }),
      ),
    );
  }
}
