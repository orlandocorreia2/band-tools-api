import { CreateBandSetlistSongsTable1785797863795 } from '@infrastructure/typeorm/migrations/1785797863795-create-band-setlist-songs-table';
import { QueryRunner, Table } from 'typeorm';

describe('CreateBandSetlistSongsTable1785797863795', () => {
  let migration: CreateBandSetlistSongsTable1785797863795;
  let queryRunner: jest.Mocked<Pick<QueryRunner, 'createTable' | 'dropTable'>>;

  beforeEach(() => {
    migration = new CreateBandSetlistSongsTable1785797863795();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(migration).toBeDefined();
  });

  describe('up', () => {
    it('should create the band_setlist_songs table', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
    });

    it('should pass a Table instance with name "band_setlist_songs"', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      expect(table).toBeInstanceOf(Table);
      expect(table.name).toBe('band_setlist_songs');
    });

    it('should pass ifNotExists=true', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [, ifNotExists] = queryRunner.createTable.mock.calls[0];
      expect(ifNotExists).toBe(true);
    });

    it('should include all expected columns', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const columnNames = table.columns.map((c) => c.name);
      expect(columnNames).toEqual(
        expect.arrayContaining([
          'id',
          'band_setlist_id',
          'band_song_id',
          'position',
          'created_at',
          'updated_at',
        ]),
      );
    });

    it('should define id as the primary key', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const primaryColumns = table.columns
        .filter((c) => c.isPrimary)
        .map((c) => c.name);
      expect(primaryColumns).toEqual(['id']);
    });

    it('should make band_setlist_id, band_song_id and position required', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const requiredColumns = ['band_setlist_id', 'band_song_id', 'position'];
      requiredColumns.forEach((name) => {
        const column = table.columns.find((c) => c.name === name);
        expect(column?.isNullable).toBe(false);
      });
    });

    it('should declare foreign keys to band_setlists and band_songs with CASCADE on delete', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const [setlistFk, songFk] = table.foreignKeys ?? [];

      expect(setlistFk?.columnNames).toEqual(['band_setlist_id']);
      expect(setlistFk?.referencedTableName).toBe('band_setlists');
      expect(setlistFk?.onDelete).toBe('CASCADE');

      expect(songFk?.columnNames).toEqual(['band_song_id']);
      expect(songFk?.referencedTableName).toBe('band_songs');
      expect(songFk?.onDelete).toBe('CASCADE');
    });

    it('should declare an index on band_setlist_id', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const indexColumns = table.indices?.flatMap((i) => i.columnNames);
      expect(indexColumns).toContain('band_setlist_id');
    });
  });

  describe('down', () => {
    it('should drop the band_setlist_songs table', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith(
        'band_setlist_songs',
        true,
      );
    });
  });
});
