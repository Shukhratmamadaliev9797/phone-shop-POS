import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user/entities/user.entity';
import { userToView } from 'src/user/user/helper';
import { AuthResultDto } from '../dto/auth-result.dto';
import { LoginDto } from '../dto/login.dto';
import { LogoutResultDto } from '../dto/logout-result.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthBaseService } from './auth-base.service';
import { AuthLoginService } from './auth-login.service';
import { AuthLogoutService } from './auth-logout.service';
import { AuthRefreshService } from './auth-refresh.service';
import { AuthRegisterService } from './auth-register.service';

@Injectable()
export class AuthService extends AuthBaseService {
  constructor(
    config: ConfigService,
    @InjectRepository(User) usersRepository: Repository<User>,
    private readonly registerService: AuthRegisterService,
    private readonly loginService: AuthLoginService,
    private readonly refreshService: AuthRefreshService,
    private readonly logoutService: AuthLogoutService,
  ) {
    super(config, usersRepository);
  }

  async register(dto: RegisterDto): Promise<AuthResultDto> {
    // Register oqimini alohida service'ga delegatsiya qilamiz.
    return this.registerService.register(dto);
  }

  async login(dto: LoginDto): Promise<AuthResultDto> {
    // Login mantiqi markazlashgan service orqali ishlaydi.
    return this.loginService.login(dto);
  }

  async refresh(dto: RefreshDto): Promise<AuthResultDto> {
    // Token yangilashni refresh service bajaradi.
    return this.refreshService.refresh(dto);
  }

  async logout(currentUserId: number): Promise<LogoutResultDto> {
    // Logout paytida token version oshiriladi.
    return this.logoutService.logout(currentUserId);
  }

  async me(currentUserEntityOrPayload: Pick<User, 'id'> | { sub: number }) {
    // `me` endpointi uchun joriy userni har doim bazadan olamiz.
    const id =
      'id' in currentUserEntityOrPayload
        ? currentUserEntityOrPayload.id
        : currentUserEntityOrPayload.sub;

    const user = await this.getActiveUserByIdOrThrow(id);
    return userToView(user);
  }
}
