import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'generated/prisma/enums';
import type { JWTPaylodType } from 'src/utils/types';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(
    private readonly JwtService: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles?.length) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token bulunamadı');
    }

    const [type, token] = authHeader.split(' ');

    if (type?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Geçersiz token tipi');
    }

    let payload: JWTPaylodType;

    try {
      payload = await this.JwtService.verifyAsync(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş token');
    }

    const user = await this.userService.currentUser(payload.id);

    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Bu işlem için yetkiniz bulunmuyor');
    }

    req.user = user;

    return true;
  }
}
