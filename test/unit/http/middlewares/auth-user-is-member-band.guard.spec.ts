import { ExecutionContext } from '@nestjs/common';
import { AuthUserIsMemberBandGuard } from '@http/middlewares/auth-user-is-member-band.guard';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { BandMemberRepository } from '@infrastructure/repository/band-member/band-member.repository';
import {
  ApplicationForbiddenException,
  ApplicationNotFoundException,
  ApplicationUnprocessableEntityException,
} from '@shared/exceptions/business.exception';

type MockRequest = {
  user: { id: string };
  params: { id: string };
};

const validBandId = '019a2635-cc34-745e-8d67-f0247e2dcba6';

const makeContext = (request: MockRequest): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

describe('AuthUserIsMemberBandGuard', () => {
  let guard: AuthUserIsMemberBandGuard;
  let bandRepository: jest.Mocked<Pick<BandRepository, 'findById'>>;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findBy'>>;
  let bandMemberRepository: jest.Mocked<
    Pick<BandMemberRepository, 'existsByBandAndUser'>
  >;

  beforeEach(() => {
    bandRepository = {
      findById: jest.fn().mockResolvedValue({ id: validBandId }),
    };
    userRepository = {
      findBy: jest.fn().mockResolvedValue({ id: 'user-uuid' }),
    };
    bandMemberRepository = {
      existsByBandAndUser: jest.fn().mockResolvedValue(true),
    };
    guard = new AuthUserIsMemberBandGuard(
      bandRepository as unknown as BandRepository,
      userRepository as unknown as UserRepository,
      bandMemberRepository as unknown as BandMemberRepository,
    );
  });

  const makeRequest = (): MockRequest => ({
    user: { id: 'user-uuid' },
    params: { id: validBandId },
  });

  it('should allow access when the band exists, the user exists, and the user is a member', async () => {
    const result = await guard.canActivate(makeContext(makeRequest()));

    expect(result).toBe(true);
  });

  it('should throw ApplicationUnprocessableEntityException when the route id is not a valid UUID v7', async () => {
    const request = { ...makeRequest(), params: { id: 'not-a-uuid' } };

    await expect(
      guard.canActivate(makeContext(request)),
    ).rejects.toBeInstanceOf(ApplicationUnprocessableEntityException);
  });

  it('should not query the band, user, or membership when the route id is not a valid UUID v7', async () => {
    const request = { ...makeRequest(), params: { id: 'not-a-uuid' } };

    await expect(guard.canActivate(makeContext(request))).rejects.toThrow();

    expect(bandRepository.findById).not.toHaveBeenCalled();
    expect(userRepository.findBy).not.toHaveBeenCalled();
    expect(bandMemberRepository.existsByBandAndUser).not.toHaveBeenCalled();
  });

  it('should look up the band by the route param id', async () => {
    await guard.canActivate(makeContext(makeRequest()));

    expect(bandRepository.findById).toHaveBeenCalledWith(validBandId);
  });

  it('should throw ApplicationNotFoundException when the band does not exist', async () => {
    bandRepository.findById.mockResolvedValueOnce(null);

    await expect(
      guard.canActivate(makeContext(makeRequest())),
    ).rejects.toBeInstanceOf(ApplicationNotFoundException);
  });

  it('should not check the user or membership when the band does not exist', async () => {
    bandRepository.findById.mockResolvedValueOnce(null);

    await expect(
      guard.canActivate(makeContext(makeRequest())),
    ).rejects.toThrow();

    expect(userRepository.findBy).not.toHaveBeenCalled();
    expect(bandMemberRepository.existsByBandAndUser).not.toHaveBeenCalled();
  });

  it('should look up the authenticated user by id', async () => {
    await guard.canActivate(makeContext(makeRequest()));

    expect(userRepository.findBy).toHaveBeenCalledWith({ id: 'user-uuid' });
  });

  it('should throw ApplicationNotFoundException when the authenticated user does not exist', async () => {
    userRepository.findBy.mockResolvedValueOnce(null);

    await expect(
      guard.canActivate(makeContext(makeRequest())),
    ).rejects.toBeInstanceOf(ApplicationNotFoundException);
  });

  it('should not check membership when the authenticated user does not exist', async () => {
    userRepository.findBy.mockResolvedValueOnce(null);

    await expect(
      guard.canActivate(makeContext(makeRequest())),
    ).rejects.toThrow();

    expect(bandMemberRepository.existsByBandAndUser).not.toHaveBeenCalled();
  });

  it('should check whether the user is a member of the band', async () => {
    await guard.canActivate(makeContext(makeRequest()));

    expect(bandMemberRepository.existsByBandAndUser).toHaveBeenCalledWith(
      validBandId,
      'user-uuid',
    );
  });

  it('should throw ApplicationForbiddenException when the user is not a member of the band', async () => {
    bandMemberRepository.existsByBandAndUser.mockResolvedValueOnce(false);

    await expect(
      guard.canActivate(makeContext(makeRequest())),
    ).rejects.toBeInstanceOf(ApplicationForbiddenException);
  });
});
