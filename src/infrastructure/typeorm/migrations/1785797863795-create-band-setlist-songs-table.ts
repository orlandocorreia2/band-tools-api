import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBandSetlistSongsTable1785797863795 implements MigrationInterface {
  private readonly tableName = 'band_setlist_songs';

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
            name: 'band_setlist_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'band_song_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'position',
            type: 'integer',
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
        ],
        foreignKeys: [
          {
            columnNames: ['band_setlist_id'],
            referencedTableName: 'band_setlists',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['band_song_id'],
            referencedTableName: 'band_songs',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_band_setlist_songs_band_setlist_id',
            columnNames: ['band_setlist_id'],
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
