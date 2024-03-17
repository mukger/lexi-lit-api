import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenJwtStrategy } from './access-token-jwt.strategy';
import { RefreshTokenStrategy } from './refresh-token-jwt.strategy';
import { RolesGuard } from './roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestjsFingerprintModule } from 'nestjs-fingerprint';
import { RefreshSession } from './refresh-session.entity';
import { RefreshSessionsRepository } from './refresh-session.repository';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, RefreshSession]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get('TOKEN_EXPIRATION_ACCESS')
          }
        }
      }
    }),
    NestjsFingerprintModule.forRoot({
      params: ['headers', 'userAgent', 'ipAddress']
    }),
  ],
  providers: [AuthService, UsersRepository, RefreshSessionsRepository, AccessTokenJwtStrategy, RolesGuard, RefreshTokenStrategy],
  controllers: [AuthController],
  exports: [AccessTokenJwtStrategy, PassportModule, RefreshTokenStrategy]
})
export class AuthModule {}
