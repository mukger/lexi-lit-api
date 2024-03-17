import { Controller, Delete, HttpStatus, Patch, HttpCode, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpCredentialsDto } from './dto/signup-credentials-dto';
import { SignInCredentialsDto } from './dto/signin-credentials-dto';
import { Post, Body, Get } from '@nestjs/common';
import { User } from './user.entity';
import { UseGuards } from '@nestjs/common';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChangeProfileInfoDto } from './dto/change-profile-info.dto';
import { SafeProfileInfo } from './safe-profile-info.interface';
import { Response } from 'express';
import { Fingerprint, IFingerprint } from 'nestjs-fingerprint';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    register(
        @Body() signUpCredentialsDto: SignUpCredentialsDto,
        @Res({ passthrough: true }) res: Response,
        @Fingerprint() fp: IFingerprint
    ): Promise<{accessToken: string, refreshToken: string}> {
        return this.authService.register(signUpCredentialsDto, res, fp.id)
    }

    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    login(
        @Body() signInCredentialsDto: SignInCredentialsDto,
        @Res({ passthrough: true }) res: Response,
        @Fingerprint() fp: IFingerprint
    ): Promise<{accessToken: string, refreshToken: string}> {
        return this.authService.login(signInCredentialsDto, res, fp.id)
    }

    @Get('/profile')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    getProfileInfo(
        @GetUser() user: User
    ): Promise<User> {
        return this.authService.getProfileInfo(user)
    }

    @Patch('/profile')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    changeProfileInfo(
        @Body() changeProfileInfoDto: ChangeProfileInfoDto,
        @GetUser() user: User
    ): Promise<SafeProfileInfo> {
        return this.authService.changeProfileInfo(changeProfileInfoDto, user)
    }

    @Post('/refresh')
    @UseGuards(JwtRefreshAuthGuard)
    refreshToken(
        @GetUser() user: User & { refreshToken: string, fingerprint: string },
        @Res({ passthrough: true }) res: Response
    ): Promise<{accessToken: string, refreshToken: string}> {
        const refreshToken = user.refreshToken
        const fingerprint = user.fingerprint
        delete user.refreshToken 
        delete user.fingerprint
        return this.authService.refreshToken(user, res, fingerprint, refreshToken)
    }

    @Delete('/profile')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    deleteProfile(
        @GetUser() user: User
    ): Promise<void> {
        return this.authService.deleteProfile(user)
    }

}
