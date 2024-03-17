import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { User } from "./user.entity";
import * as bcrypt from "bcrypt"
import { SignUpCredentialsDto } from "./dto/signup-credentials-dto";
import { ConflictException } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(authCredentialsDto: SignUpCredentialsDto): Promise<User> {
    const { login, email, password, nativeLanguage } = authCredentialsDto

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = this.create({
        login,
        email,
        password: hashedPassword,
        native_language: nativeLanguage
    })

    try {
        await this.save(user)
    } catch (error) {
        if (+error.code === 23505) {
          if (error.driverError.detail.includes('email')) {
            throw new ConflictException('Account with this email already exists')
          }
          else if (error.driverError.detail.includes('login')) {
            throw new ConflictException('Account with this login already exists')
          }
        } else {
            throw new InternalServerErrorException("Ooops... Something went wrong...")
        }
    }

    return user
  }

  async findUserByEmailOrLogin(loginOrEmail: string): Promise<User> {
    const query = this.createQueryBuilder('user')
    query.andWhere('(user.login = :loginOrEmail OR user.email = :loginOrEmail)', { loginOrEmail })
    const found = await query.getOne()
    return found
  }
}