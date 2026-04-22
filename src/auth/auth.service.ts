import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { handleDBExceptions } from 'src/common/helpers/exception.helper';
import { LoginUserDto } from './dto/login-user.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepostory: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(createAuthDto: CreateUserDto) {
    try {
      const { password, ...userDate } = createAuthDto;

      const user = this.userRepostory.create({
        ...userDate,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepostory.save(user);

      const { accessToken, refreshToken } = this.getJwtTokens({ id: user.id });
      await this.setCurrentRefreshToken(refreshToken, user.id);

      return {
        ...this.buildAuthResponse(user, accessToken, refreshToken),
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepostory
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) throw new UnauthorizedException(`Credential not valid`);

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Credential not valid`);

    const { accessToken, refreshToken } = this.getJwtTokens({ id: user.id });
    await this.setCurrentRefreshToken(refreshToken, user.id);

    return {
      ...this.buildAuthResponse(user, accessToken, refreshToken),
    };
  }

  async checkAuthStatus(user: User) {
    const { accessToken, refreshToken } = this.getJwtTokens({ id: user.id });
    await this.setCurrentRefreshToken(refreshToken, user.id);

    return {
      ...this.buildAuthResponse(user, accessToken, refreshToken),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.userRepostory
      .createQueryBuilder('user')
      .addSelect('user.currentHashedRefreshToken')
      .where('user.id = :id', { id: payload.id })
      .getOne();

    if (!user || !user.currentHashedRefreshToken) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    if (!bcrypt.compareSync(refreshToken, user.currentHashedRefreshToken)) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive, talk with an admin');
    }

    const tokens = this.getJwtTokens({ id: user.id });
    await this.setCurrentRefreshToken(tokens.refreshToken, user.id);

    return this.buildAuthResponse(user, tokens.accessToken, tokens.refreshToken);
  }

  async logout(user: User) {
    await this.userRepostory.update(user.id, {
      currentHashedRefreshToken: null,
    });

    return { message: 'Logged out successfully' };
  }

  private getJwtTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.getRefreshTokenSecret(),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private getRefreshTokenSecret() {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET')
    );
  }

  private async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);

    await this.userRepostory.update(userId, {
      currentHashedRefreshToken: hashedRefreshToken,
    });
  }

  private buildAuthResponse(
    user: User,
    token: string,
    refreshToken: string,
  ) {
    const {
      password,
      currentHashedRefreshToken,
      ...safeUser
    } = user as User & {
      password?: string;
      currentHashedRefreshToken?: string | null;
    };

    return {
      ...safeUser,
      token,
      refreshToken,
    };
  }
}