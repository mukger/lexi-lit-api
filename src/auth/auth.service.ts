import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpCredentialsDto } from './dto/signup-credentials-dto';
import { SignInCredentialsDto } from './dto/signin-credentials-dto';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UsersRoles } from 'src/data/users-roles';
import { User } from './user.entity';
import { ChangeProfileInfoDto } from './dto/change-profile-info.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { SafeProfileInfo } from './safe-profile-info.interface';
import { Response } from 'express';
import { RefreshSessionsRepository } from './refresh-session.repository';
import { IFingerprint } from 'nestjs-fingerprint';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UsersRepository)
        private readonly usersRepository: UsersRepository,
        @InjectRepository(RefreshSessionsRepository)
        private readonly refreshSessionsRepository: RefreshSessionsRepository,
        private configService: ConfigService,
        private jwtService: JwtService
    ) {}

    async register(
        signUpCredentialsDto: SignUpCredentialsDto,
        res: Response,
        fp: string
    ): Promise<{accessToken: string, refreshToken: string}> {
        const user = await this.usersRepository.createUser(signUpCredentialsDto)
        const { login } = signUpCredentialsDto
        const tokens = await this.formTokens(login, UsersRoles.USER)
        res.cookie("accessToken", tokens.accessToken, { httpOnly: true })
        res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true })
        await this.refreshSessionsRepository.createRefreshSession(
            tokens.refreshToken,
            user,
            fp,
            this.configService.get('TOKEN_EXPIRATION_REFRESH')
        )
        return tokens
    }

    async login(
        signInCredentialsDto: SignInCredentialsDto,
        res: Response,
        fp: string
    ): Promise<{accessToken: string, refreshToken: string}> {
        const { loginOrEmail, password } = signInCredentialsDto
        const user = await this.usersRepository.findUserByEmailOrLogin(loginOrEmail)
        if (user && (await bcrypt.compare(password, user.password))) {
            const tokens = await this.formTokens(user.login, UsersRoles.USER)
            res.cookie("accessToken", tokens.accessToken, { httpOnly: true })
            res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true })
            await this.refreshSessionsRepository.createRefreshSession(
                tokens.refreshToken,
                user,
                fp,
                this.configService.get('TOKEN_EXPIRATION_REFRESH')
            )
            return tokens
        }
        else {
            throw new UnauthorizedException('Please check your inputed credentials')
        }
    }

    async getProfileInfo(user: User): Promise<User> {
        const { login } = user
        const found = await this.usersRepository.findOneBy({login})
        if (found) {
            return found
        }
        else {
            throw new NotFoundException()
        }
    }

    async changeProfileInfo(
        changeProfileInfoDto: ChangeProfileInfoDto,
        user: User
    ): Promise<SafeProfileInfo> {
        const { login } = user
        const found = await this.usersRepository.findOneBy({login})
        if (found) {
            const { login, email, nativeLanguage } = changeProfileInfoDto
            if (login) {
                found.login = login
            }
            if (email) {
                found.email = email
            }
            if (nativeLanguage) {
                found.native_language = nativeLanguage
            }

            try {
                await this.usersRepository.save(found)
            } catch (error) {
                if (+error.code === 23505) {
                    throw new ConflictException('User with this login already exists')
                } else {
                    throw new InternalServerErrorException("Ooops... Something went wrong...")
                }
            }

            let result: SafeProfileInfo = {
                login: found.login,
                email: found.email,
                native_language: found.native_language,
                role: found.role,
                registration_date: found.registration_date
            }
            if (login) {
                const tokens = await this.formTokens(login, found.role)
                result.access_token = tokens.accessToken
                result.refresh_token = tokens.refreshToken
            }
            return result
        }
        else {
            throw new NotFoundException()
        }
    }

    async deleteProfile(user: User): Promise<void> {
        this.usersRepository.remove(user)
    }

    async refreshToken(
        user: User,
        res: Response,
        fp: string,
        refreshToken: string
    ): Promise<{accessToken: string, refreshToken: string}> {
        await this.refreshSessionsRepository.deleteRefreshSession(user, fp, refreshToken)
        const tokens = await this.formTokens(user.login, UsersRoles.USER)
        res.cookie("accessToken", tokens.accessToken, { httpOnly: true })
        res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true })
        await this.refreshSessionsRepository.createRefreshSession(
            tokens.refreshToken,
            user,
            fp,
            this.configService.get('TOKEN_EXPIRATION_REFRESH')
        )
        return tokens
    }

    private async formTokens(login: string, role: UsersRoles): Promise<{accessToken: string, refreshToken: string}> {
        const accessToken = await this.jwtService.signAsync({login, role, type: 'access'})
        const refreshToken = await this.jwtService.signAsync(
            {login, role, type: 'refresh'},
            {expiresIn: this.configService.get('TOKEN_EXPIRATION_REFRESH')}
        )
        return { accessToken, refreshToken }
    }
}
