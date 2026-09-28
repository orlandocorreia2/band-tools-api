import { LinkBandBookingContact1787285512757 } from '@infrastructure/typeorm/migrations/1787285512757-link-band-booking-contact';
import { QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

describe('LinkBandBookingContact1787285512757', () => {
  let migration: LinkBandBookingContact1787285512757;
  let queryRunner: jest.Mocked<
    Pick<
      QueryRunner,
      | 'dropColumns'
      | 'addColumn'
      | 'addColumns'
      | 'createIndex'
      | 'createForeignKey'
      | 'dropForeignKey'
      | 'dropIndex'
      | 'dropColumn'
    >
  >;

  beforeEach(() => {
    migration = new LinkBandBookingContact1787285512757();
    queryRunner = {
      dropColumns: jest.fn().mockResolvedValue(undefined),
      addColumn: jest.fn().mockResolvedValue(undefined),
      addColumns: jest.fn().mockResolvedValue(undefined),
      createIndex: jest.fn().mockResolvedValue(undefined),
      createForeignKey: jest.fn().mockResolvedValue(undefined),
      dropForeignKey: jest.fn().mockResolvedValue(undefined),
      dropIndex: jest.fn().mockResolvedValue(undefined),
      dropColumn: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(migration).toBeDefined();
  });

  describe('up', () => {
    it('should drop focal_point_name, phone and address from band_bookings', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropColumns).toHaveBeenCalledWith('band_bookings', [
        'focal_point_name',
        'phone',
        'address',
      ]);
    });

    it('should add a non-nullable contact_id uuid column', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table, column] = queryRunner.addColumn.mock.calls[0];
      expect(table).toBe('band_bookings');
      expect(column).toBeInstanceOf(TableColumn);
      expect(column.name).toBe('contact_id');
      expect(column.type).toBe('uuid');
      expect(column.isNullable).toBe(false);
    });

    it('should create an index on contact_id', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table, index] = queryRunner.createIndex.mock.calls[0];
      expect(table).toBe('band_bookings');
      expect(index).toBeInstanceOf(TableIndex);
      expect(index.columnNames).toEqual(['contact_id']);
    });

    it('should create a foreign key to user_contacts with RESTRICT on delete', async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      const [table, foreignKey] = queryRunner.createForeignKey.mock.calls[0];
      expect(table).toBe('band_bookings');
      expect(foreignKey).toBeInstanceOf(TableForeignKey);
      expect(foreignKey.columnNames).toEqual(['contact_id']);
      expect(foreignKey.referencedTableName).toBe('user_contacts');
      expect(foreignKey.referencedColumnNames).toEqual(['id']);
      expect(foreignKey.onDelete).toBe('CASCADE');
    });
  });

  describe('down', () => {
    it('should drop the foreign key, index and contact_id column', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.dropForeignKey).toHaveBeenCalledWith(
        'band_bookings',
        'FK_band_bookings_contact_id',
      );
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'band_bookings',
        'IDX_band_bookings_contact_id',
      );
      expect(queryRunner.dropColumn).toHaveBeenCalledWith(
        'band_bookings',
        'contact_id',
      );
    });

    it('should restore focal_point_name, phone and address as nullable varchar columns', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      const [table, columns] = queryRunner.addColumns.mock.calls[0];
      expect(table).toBe('band_bookings');
      const names = columns.map((c) => c.name);
      expect(names).toEqual(['focal_point_name', 'phone', 'address']);
      columns.forEach((column) => {
        expect(column.isNullable).toBe(true);
      });
      const phoneColumn = columns.find((c) => c.name === 'phone');
      expect(phoneColumn?.length).toBe('11');
    });
  });
});
