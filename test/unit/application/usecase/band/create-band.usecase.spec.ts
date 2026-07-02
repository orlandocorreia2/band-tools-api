import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import type { CreateBandUseCaseInterface } from '@usecase/band/interfaces';
import { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import { BandEntity } from '@domain/entities/band/band.entity';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import { BandStatusEnum } from '@shared/commons/enums/band.enum';

const makeDto = (): CreateBandDto => ({
  name: 'The Beatles',
  genre: 'Rock',
  state: 'England',
  city: 'Liverpool',
  neighborhood: 'Woolton',
  address: '251 Menlove Avenue',
  started_at: new Date('1960-01-01'),
  status: BandStatusEnum.Active,
});

describe('CreateBandUseCase', () => {
  let useCase: CreateBandUseCaseInterface;
  let bandRepository: jest.Mocked<IBandRepository>;

  beforeEach(() => {
    bandRepository = { save: jest.fn().mockResolvedValue(undefined) };
    useCase = new CreateBandUseCase(bandRepository);
  });

  it('should call repository.save with a BandEntity instance', async () => {
    await useCase.execute(makeDto());

    expect(bandRepository.save).toHaveBeenCalledTimes(1);
    expect(bandRepository.save).toHaveBeenCalledWith(expect.any(BandEntity));
  });

  it('should create BandEntity with the correct props from dto', async () => {
    const dto = makeDto();
    await useCase.execute(dto);

    const savedBand: BandEntity = bandRepository.save.mock.calls[0][0];
    expect(savedBand.name).toBe(dto.name);
    expect(savedBand.genre).toBe(dto.genre);
    expect(savedBand.status).toBe(dto.status);
  });

  it('should return void', async () => {
    const result = await useCase.execute(makeDto());

    expect(result).toBeUndefined();
  });

  it('should pass optional fields to BandEntity when provided', async () => {
    const dto = {
      ...makeDto(),
      description: 'Legend',
      image: 'https://img.com/x.jpg',
    };
    await useCase.execute(dto);

    const savedBand: BandEntity = bandRepository.save.mock.calls[0][0];
    expect(savedBand.description).toBe('Legend');
  });
});
