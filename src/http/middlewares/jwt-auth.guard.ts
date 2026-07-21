import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApplicationUnauthorizedException } from '@shared/exceptions/business.exception';

type JwtPayload = { sub: string; email: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new ApplicationUnauthorizedException({
        detail: 'Token de acesso ausente',
      });
    }

    const payload = await this.verifyToken(token);
    request.user = { id: payload.sub, email: payload.email };
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = (request.headers?.authorization ?? '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new ApplicationUnauthorizedException({
        detail: 'Token de acesso inválido ou expirado',
      });
    }
  }
}
