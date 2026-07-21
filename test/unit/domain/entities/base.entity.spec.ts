import { BaseEntity } from '@domain/entities/base.entity';

class ConcreteEntity extends BaseEntity {
  constructor(
    props: { id?: string; updated_at?: Date; deleted_at?: Date } = {},
  ) {
    super(props);
  }
}

describe('BaseEntity', () => {
  it('should generate a UUIDv7 id when none is provided', () => {
    const entity = new ConcreteEntity();
    expect(entity.id).toBeDefined();
    expect(typeof entity.id).toBe('string');
    expect(entity.id).toHaveLength(36);
  });

  it('should use the provided id when given', () => {
    const customId = '01900000-0000-7000-8000-000000000001';
    const entity = new ConcreteEntity({ id: customId });
    expect(entity.id).toBe(customId);
  });

  it('should set created_at to current date on instantiation', () => {
    const before = new Date();
    const entity = new ConcreteEntity();
    const after = new Date();
    expect(entity.created_at).toBeInstanceOf(Date);
    expect(entity.created_at.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(entity.created_at.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should set updated_at to current date when none is provided', () => {
    const before = new Date();
    const entity = new ConcreteEntity();
    const after = new Date();
    expect(entity.updated_at).toBeInstanceOf(Date);
    expect(entity.updated_at.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
    expect(entity.updated_at.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should use the provided updated_at when given', () => {
    const customDate = new Date('2020-01-01');
    const entity = new ConcreteEntity({ updated_at: customDate });
    expect(entity.updated_at).toBe(customDate);
  });

  it('should generate different ids for different instances', () => {
    const entity1 = new ConcreteEntity();
    const entity2 = new ConcreteEntity();
    expect(entity1.id).not.toBe(entity2.id);
  });
});
