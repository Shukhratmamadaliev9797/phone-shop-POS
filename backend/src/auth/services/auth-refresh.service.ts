import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthResultDto } from '../dto/auth-result.dto';
import { RefreshDto } from '../dto/refresh.dto';
import {
  RefreshPayload,
  toAuthResult,
  tokenVersionMatches,
} from '../shared';
import { AuthBaseService } from './auth-base.service';
import { AuthSigningService } from './auth-signing.service';
import { User } from 'src/user/user/entities/user.entity';

@Injectable()
export class AuthRefreshService extends AuthBaseService {
  constructor(
    config: ConfigService,
    @InjectRepository(User) usersRepository: Repository<User>,
    private readonly jwt: JwtService,
    private readonly signing: AuthSigningService,
  ) {
    super(config, usersRepository);
  }

  async refresh(dto: RefreshDto): Promise<AuthResultDto> {
    // Refresh token bo'sh bo'lsa darhol 401 qaytaramiz.
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const payload = await this.jwt
      .verifyAsync<RefreshPayload>(dto.refreshToken, {
        secret: this.refreshSecret,
      })
      .catch(() => null);

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.getActiveUserByIdOrThrow(payload.sub).catch(
      () => null,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (!tokenVersionMatches(payload.tokenVersion, user.refreshTokenVersion)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Token versiyasi mos bo'lsa yangi access/refresh juftligini beramiz.
    const tokens = await this.signing.signTokens(user);
    return toAuthResult(user, tokens);
  }
}
