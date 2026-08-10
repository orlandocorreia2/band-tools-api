import { CreateBandBookingsTable1786145039439 } from '@infrastructure/typeorm/migrations/1786145039439-create-band-bookings-table';
import { QueryRunner, Table } from 'typeorm';

describe('CreateBandBookingsTable1786145039439', () => {
  let migration: CreateBandBookingsTable1786145039439;
  let queryRunner: jest.Mocked<Pick<QueryRunner, 'createTable' | 'dropTable'>>;

  beforeEach(() => {
    migration = new CreateBandBookingsTable1786145039439();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(migration).toBeDefined();
  });

  describe('up', () => {
    it('should create the band_bookings table', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledTimes(1);
    });

    it('should pass a Table instance with name "band_bookings"', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      expect(table).toBeInstanceOf(Table);
      expect(table.name).toBe('band_bookings');
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
          'focal_point_name',
          'phone',
          'date',
          'start_time',
          'duration',
          'address',
          'fee',
          'status',
          'consumption',
          'link',
          'note',
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

    it('should make the required fields non-nullable', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const requiredColumns = [
        'title',
        'focal_point_name',
        'phone',
        'date',
        'start_time',
        'duration',
        'address',
        'fee',
        'status',
      ];
      requiredColumns.forEach((name) => {
        const column = table.columns.find((c) => c.name === name);
        expect(column?.isNullable).toBe(false);
      });
    });

    it('should make consumption, link and note nullable', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      ['consumption', 'link', 'note'].forEach((name) => {
        const column = table.columns.find((c) => c.name === name);
        expect(column?.isNullable).toBe(true);
      });
    });

    it('should default status to Pending', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const statusColumn = table.columns.find((c) => c.name === 'status');
      expect(statusColumn?.default).toBe("'Pending'");
    });

    it('should declare fee as numeric(10,2)', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const feeColumn = table.columns.find((c) => c.name === 'fee');
      expect(feeColumn?.type).toBe('numeric');
      expect(feeColumn?.precision).toBe(10);
      expect(feeColumn?.scale).toBe(2);
    });

    it('should limit phone to 11 characters', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table] = queryRunner.createTable.mock.calls[0];
      const phoneColumn = table.columns.find((c) => c.name === 'phone');
      expect(phoneColumn?.length).toBe('11');
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
    it('should drop the band_bookings table', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropTable).toHaveBeenCalledWith('band_bookings', true);
    });
  });
});
