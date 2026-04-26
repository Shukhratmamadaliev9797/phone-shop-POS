import { AuthResultDto } from '../dto/auth-result.dto';
import { UserView, userToView } from 'src/user/user/helper';

type AuthTokensLike =
  | { accessToken: string; refreshToken: string }
  | { access_token: string; refresh_token: string };

export function toAuthResult(
  user: Parameters<typeof userToView>[0],
  tokens: AuthTokensLike,
): AuthResultDto {
  const normalizedTokens =
    'accessToken' in tokens
      ? tokens
      : {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        };

  return {
    user: userToView(user) as UserView,
    tokens: normalizedTokens,
  };
}
