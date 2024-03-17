import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenTypes } from 'src/data/token-types';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwt-payload.interface';
import { UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { RefreshSessionsRepository } from './refresh-session.repository';
import { User } from './user.entity';

const jwtCookieExtractor = (req: Request): string => {
  let token = null;
  if (req && req.cookies) {
      token = req.cookies['refreshToken'];
  }
  return token;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @InjectRepository(RefreshSessionsRepository)
    private refreshSessionsRepository: RefreshSessionsRepository,
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([jwtCookieExtractor]),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<User & { refreshToken: string, fingerprint: string }> {
    const { type, login } = payload
    const refreshToken = req.cookies['refreshToken']
    const fingerprint = req.cookies['fp']
    const user: User = await this.usersRepository.findOneBy({ login })
    if (!user || type !== TokenTypes.REFRESH || (!fingerprint && fingerprint.length !== 0)) {
      throw new UnauthorizedException()
    }
    const found = this.refreshSessionsRepository.findOneBy({ user: { login }, refresh_token: refreshToken })
    if (!found) {
      throw new UnauthorizedException()
    }
    
    return { ...user, refreshToken, fingerprint }
  }
}