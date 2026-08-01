import { CreateBandSongsTable1784674324900 } from '@infrastructure/typeorm/migrations/1784674324900-create-band-songs-table';
import { QueryRunner, Table } from 'typeorm';

describe('CreateBandSongsTable1784674324900', () => {
  let migration: CreateBandSongsTable1784674324900;
  let queryRunner: jest.Mocked<Pick<QueryRunner, 'createTable' | 'dropTable'>>;

  beforeEach(() => {
    migration = new CreateBandSongsTable1784674324900();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(migration).toBeDefined();
  });

  describe('up', () => {
    it('should create the band_songs table', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
    });

    it('should pass a Table instance with name "band_songs"', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      expect(table).toBeInstanceOf(Table);
      expect(table.name).toBe('band_songs');
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
          'band_id',
          'title',
          'tuning',
          'tonality',
          'bpm',
          'duration',
          'lyrics',
          'notes',
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

    it('should make title required and optional fields nullable', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const titleColumn = table.columns.find((c) => c.name === 'title');
      const tuningColumn = table.columns.find((c) => c.name === 'tuning');
      expect(titleColumn?.isNullable).toBe(false);
      expect(tuningColumn?.isNullable).toBe(true);
    });

    it('should declare a foreign key to bands with CASCADE on delete', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const [fk] = table.foreignKeys ?? [];
      expect(fk?.columnNames).toEqual(['band_id']);
      expect(fk?.referencedTableName).toBe('bands');
      expect(fk?.onDelete).toBe('CASCADE');
    });

    it('should declare an index on band_id', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const indexColumns = table.indices?.flatMap((i) => i.columnNames);
      expect(indexColumns).toContain('band_id');
    });
  });

  describe('down', () => {
    it('should drop the band_songs table', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith('band_songs', true);
    });
  });
});
