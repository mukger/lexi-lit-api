import { JsonContains, Repository } from "typeorm";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { RefreshSession } from "./refresh-session.entity";
import { User } from "./user.entity";
import { IFingerprint } from "nestjs-fingerprint";
import { InternalServerErrorException } from "@nestjs/common";
import { Not, IsNull } from "typeorm";

@Injectable()
export class RefreshSessionsRepository extends Repository<RefreshSession> {
  constructor(private dataSource: DataSource) {
    super(RefreshSession, dataSource.createEntityManager());
  }

  async createRefreshSession(refreshToken: string, user: User, fp: string, expiresIn: number): Promise<RefreshSession> {
    const refreshSession = this.create({
        user,
        refresh_token: refreshToken,
        fingerprint: fp,
        expires_in: expiresIn
    })
    await this.deleteOldRefreshSession(user, fp)
    try {
        await this.save(refreshSession)
    } catch (error) {
        throw new InternalServerErrorException("Ooops... Something went wrong...")
    }
    
    return
  }

  async deleteRefreshSession(user: User, fp: string, refreshToken: string): Promise<void> {
    const result = await this.delete({
      id: Not(IsNull()),
      user: { id: user.id },
      fingerprint: fp,
      refresh_token: refreshToken
    })
    if (result.affected === 0) {
      throw new UnauthorizedException()
    }
  }

  async deleteOldRefreshSession(user: User, fp: string): Promise<void> {
    await this.delete({
      id: Not(IsNull()),
      user: { id: user.id },
      fingerprint: fp 
    })
  }
}