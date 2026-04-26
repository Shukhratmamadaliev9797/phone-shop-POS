import { UserRole } from 'src/user/user/entities/user.entity';

type AuthUserLike = {
  id: number;
  role: UserRole;
  refreshTokenVersion?: number;
};

export interface AccessPayload {
  sub: number;
  role: UserRole;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export interface RefreshPayload {
  sub: number;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

export function buildAccessPayload(user: AuthUserLike): AccessPayload {
  return {
    sub: user.id,
    role: user.role,
    tokenVersion: user.refreshTokenVersion ?? 0,
  };
}

export function buildRefreshPayload(user: AuthUserLike): RefreshPayload {
  return {
    sub: user.id,
    tokenVersion: user.refreshTokenVersion ?? 0,
  };
}

export function tokenVersionMatches(
  payloadVersion: number | undefined,
  userVersion: number | undefined,
): boolean {
  return (payloadVersion ?? 0) === (userVersion ?? 0);
}
