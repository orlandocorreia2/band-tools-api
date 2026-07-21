import { CreateBandUseCase } from '@usecase/band/create-band.usecase';
import type { CreateBandUseCaseInterface } from '@usecase/band/interfaces';
import { IBandRepository } from '@domain/repositories/band/band.repository.interface';
import { IUserRepository } from '@domain/repositories/user/user.repository.interface';
import { BandEntity } from '@domain/entities/band/band.entity';
import { UserEntity } from '@domain/entities/user/user.entity';
import { CreateBandDto } from '@shared/communication/dtos/band/create-band.dto';
import { ApplicationNotFoundException } from '@shared/exceptions/business.exception';

const userId = 'user-uuid';

const makeDto = (): CreateBandDto => ({
  name: 'The Beatles',
  genre: 'Rock',
  state: 'England',
  city: 'Liverpool',
  neighborhood: 'Woolton',
  address: '251 Menlove Avenue',
  started_at: new Date('1960-01-01'),
});

const makeUser = (): UserEntity =>
  ({ id: userId, email: 'john@example.com' }) as unknown as UserEntity;

describe('CreateBandUseCase', () => {
  let useCase: CreateBandUseCaseInterface;
  let bandRepository: jest.Mocked<IBandRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    bandRepository = {
      saveWithOwner: jest.fn().mockResolvedValue(undefined),
    };
    userRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findBy: jest.fn().mockResolvedValue(makeUser()),
    };
    useCase = new CreateBandUseCase(bandRepository, userRepository);
  });

  it('should look up the authenticated user by id', async () => {
    await useCase.execute(makeDto(), userId);

    expect(userRepository.findBy).toHaveBeenCalledWith({ id: userId });
  });

  it('should call repository.saveWithOwner with a BandEntity instance and the userId', async () => {
    await useCase.execute(makeDto(), userId);

    expect(bandRepository.saveWithOwner).toHaveBeenCalledTimes(1);
    expect(bandRepository.saveWithOwner).toHaveBeenCalledWith(
      expect.any(BandEntity),
      userId,
    );
  });

  it('should create BandEntity with the correct props from dto', async () => {
    const dto = makeDto();
    await useCase.execute(dto, userId);

    const savedBand: BandEntity = bandRepository.saveWithOwner.mock.calls[0][0];
    expect(savedBand.name).toBe(dto.name);
    expect(savedBand.genre).toBe(dto.genre);
  });

  it('should return void', async () => {
    const result = await useCase.execute(makeDto(), userId);

    expect(result).toBeUndefined();
  });

  it('should pass optional fields to BandEntity when provided', async () => {
    const dto = {
      ...makeDto(),
      description: 'Legend',
      image: 'https://img.com/x.jpg',
    };
    await useCase.execute(dto, userId);

    const savedBand: BandEntity = bandRepository.saveWithOwner.mock.calls[0][0];
    expect(savedBand.description).toBe('Legend');
  });

  it('should throw ApplicationNotFoundException when the authenticated user does not exist', async () => {
    userRepository.findBy.mockResolvedValueOnce(null);

    await expect(useCase.execute(makeDto(), userId)).rejects.toBeInstanceOf(
      ApplicationNotFoundException,
    );
  });

  it('should not save the band when the authenticated user does not exist', async () => {
    userRepository.findBy.mockResolvedValueOnce(null);

    await expect(useCase.execute(makeDto(), userId)).rejects.toThrow();

    expect(bandRepository.saveWithOwner).not.toHaveBeenCalled();
  });
});
