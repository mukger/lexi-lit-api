import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersRepository } from "./users.repository";
import { JwtPayload } from "./jwt-payload.interface";
import { User } from "./user.entity";
import { ConfigService } from "@nestjs/config";
import { TokenTypes } from "src/data/token-types";

const jwtCookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['accessToken'];
    }
    return token;
};

@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(UsersRepository)
        private usersRepository: UsersRepository,
        private configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromExtractors([jwtCookieExtractor])
        })
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { login, type } = payload
        const user: User = await this.usersRepository.findOneBy({login})
        if (!user || type !== TokenTypes.ACCESS) {
            throw new UnauthorizedException()
        }
        
        return user
    }
}