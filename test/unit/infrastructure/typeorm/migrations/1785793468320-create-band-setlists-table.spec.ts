import { CreateBandSetlistsTable1785793468320 } from '@infrastructure/typeorm/migrations/1785793468320-create-band-setlists-table';
import { QueryRunner, Table } from 'typeorm';

describe('CreateBandSetlistsTable1785793468320', () => {
  let migration: CreateBandSetlistsTable1785793468320;
  let queryRunner: jest.Mocked<Pick<QueryRunner, 'createTable' | 'dropTable'>>;

  beforeEach(() => {
    migration = new CreateBandSetlistsTable1785793468320();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(migration).toBeDefined();
  });

  describe('up', () => {
    it('should create the band_setlists table', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
    });

    it('should pass a Table instance with name "band_setlists"', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      expect(table).toBeInstanceOf(Table);
      expect(table.name).toBe('band_setlists');
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
          'name',
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

    it('should make name required', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const nameColumn = table.columns.find((c) => c.name === 'name');
      expect(nameColumn?.isNullable).toBe(false);
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
    it('should drop the band_setlists table', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith('band_setlists', true);
    });
  });
});
