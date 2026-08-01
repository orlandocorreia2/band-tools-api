import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { BandRepository } from '@infrastructure/repository/band/band.repository';
import { UserRepository } from '@infrastructure/repository/user/user.repository';
import { BandMemberRepository } from '@infrastructure/repository/band-member/band-member.repository';
import {
  ApplicationForbiddenException,
  ApplicationNotFoundException,
  ApplicationUnprocessableEntityException,
} from '@shared/exceptions/business.exception';

type AuthenticatedRequest = {
  user: { id: string };
  params: { id: string };
};

@Injectable()
export class AuthUserIsMemberBandGuard implements CanActivate {
  constructor(
    private readonly bandRepository: BandRepository,
    private readonly userRepository: UserRepository,
    private readonly bandMemberRepository: BandMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!isUUID(request.params.id, 7)) {
      throw new ApplicationUnprocessableEntityException({
        detail: 'Validation failed',
        errors: [
          {
            field: 'id',
            detail:
              'id must be a valid UUID v7, Ex: 019a2635-cc34-745e-8d67-f0247e2dcba6',
          },
        ],
      });
    }

    const band = await this.bandRepository.findById(request.params.id);

    if (!band) {
      throw new ApplicationNotFoundException({
        detail: 'Banda não encontrada',
      });
    }

    const user = await this.userRepository.findBy({ id: request.user.id });

    if (!user) {
      throw new ApplicationNotFoundException({
        detail: 'Usuário autenticado não encontrado',
      });
    }

    const isMember = await this.bandMemberRepository.existsByBandAndUser(
      request.params.id,
      request.user.id,
    );

    if (!isMember) {
      throw new ApplicationForbiddenException({
        detail: 'Usuário não é membro da banda',
      });
    }

    return true;
  }
}
