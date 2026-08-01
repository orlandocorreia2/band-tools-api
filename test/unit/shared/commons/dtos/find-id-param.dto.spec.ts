import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindIdParamDto } from '@shared/commons/dtos/find-id-param.dto';

const validUuidV7 = '019a2635-cc34-745e-8d67-f0247e2dcba6';

const toDto = (plain: object) => plainToInstance(FindIdParamDto, plain);

describe('FindIdParamDto', () => {
  it('should pass validation with a valid UUID v7', async () => {
    const errors = await validate(toDto({ id: validUuidV7 }));
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when id is not a UUID', async () => {
    const errors = await validate(toDto({ id: 'not-a-uuid' }));
    expect(errors.some((e) => e.property === 'id')).toBe(true);
  });

  it('should fail validation when id is a UUID of a different version', async () => {
    const uuidV4 = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const errors = await validate(toDto({ id: uuidV4 }));
    expect(errors.some((e) => e.property === 'id')).toBe(true);
  });

  it('should fail validation when id is missing', async () => {
    const errors = await validate(toDto({}));
    expect(errors.some((e) => e.property === 'id')).toBe(true);
  });
});
