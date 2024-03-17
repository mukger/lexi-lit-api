import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Friend } from "./friend.entity";
import { User } from "src/auth/user.entity";
import { ConflictException } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class FriendsRepository extends Repository<Friend> {
  constructor(private dataSource: DataSource) {
    super(Friend, dataSource.createEntityManager());
  }

  async getConfirmedFriends(userId: string): Promise<User[]> {
    const result = []
    const confirm = true
    const fquery = this.createQueryBuilder('friend')
    fquery.andWhere("(friend.initiator_id = :userId AND friend.confirm = :confirm)",
      {userId, confirm})
    fquery.leftJoinAndSelect("friend.invited", "user")
    result.push(...(await fquery.getMany()).map(el => el.invited))

    const squery = this.createQueryBuilder('friend')
    squery.andWhere("(friend.invited_id = :userId AND friend.confirm = :confirm)",
      {userId, confirm})
    squery.leftJoinAndSelect("friend.initiator", "user")
    result.push(...(await squery.getMany()).map(el => el.initiator))
    return result
  }

  async getUnconfirmedInvitedFriends(userId: string): Promise<User[]> {
    const result = []
    const confirm = false
    const query = this.createQueryBuilder('friend')
    query.andWhere("(friend.initiator_id = :userId AND friend.confirm = :confirm)",
      {userId, confirm})
    query.leftJoinAndSelect("friend.invited", "user")
    result.push(...(await query.getMany()).map(el => el.invited))
    return result
  }

  async getUnconfirmedInitiatorFriends(userId: string): Promise<User[]> {
    const result = []
    const confirm = false
    const query = this.createQueryBuilder('friend')
    query.andWhere("(friend.invited_id = :userId AND friend.confirm = :confirm)",
      {userId, confirm})
    query.leftJoinAndSelect("friend.initiator", "user")
    result.push(...(await query.getMany()).map(el => el.initiator))
    return result
  }

  async createFriend(initiatorId: string, invitedId: string): Promise<Friend> {
    const query = this.createQueryBuilder('friend')
    query.andWhere('((friend.initiator_id = :initiatorId AND friend.invited_id = :invitedId) ' +
      'OR (friend.initiator_id = :invitedId AND friend.invited_id = :initiatorId))',
      {initiatorId, invitedId})
    const found = await query.getOne()

    if (found) {
      throw new ConflictException('You already invited this user to friends')
    }

    const friend = this.create({
      initiator_id: initiatorId,
      invited_id: invitedId
    })
    
    try {
      await this.save(friend)
    } catch (error) {
      throw new InternalServerErrorException("Ooops... Something went wrong...")
    }
    
    return friend
  }

  async findFriend(initiatorId: string, invitedId: string): Promise<Friend> {
    const query = this.createQueryBuilder('friend')
    query.andWhere('(friend.initiator_id = :initiatorId AND friend.invited_id = :invitedId)',
      {initiatorId, invitedId})
    return query.getOne()
  }

  async deleteUnconfirmedInvitedFriend(userId: string, invitedId: string): Promise<void> {
    const confirm = false
    const query = this.createQueryBuilder('friend')
    
    query.andWhere('(friend.initiator_id = :userId AND friend.invited_id = :invitedId AND friend.confirm = :confirm)',
      {userId, invitedId, confirm})
    const found = await query.delete().execute()
    if (found.affected === 0) {
      throw new NotFoundException("There is no friend invitation with this id")
    }
  }

  async deleteUnconfirmedInitiatorFriend(userId: string, initiatorId: string): Promise<void> {
    console.log()
    const confirm = false
    const query = this.createQueryBuilder('friend')
    query.andWhere('(friend.initiator_id = :initiatorId AND friend.invited_id = :userId AND friend.confirm = :confirm)',
      {initiatorId, userId, confirm})
    const found = await query.delete().execute()
    if (found.affected === 0) {
      throw new NotFoundException("There is no friend invitation with this id")
    }
  }

  async deleteConfirmedFriend(userId: string, friendId: string): Promise<void> {
    const query = this.createQueryBuilder('friend')
    query.andWhere('(((friend.initiator_id = :userId AND friend.invited_id = :friendId) ' +
      'OR (friend.initiator_id = :friendId AND friend.invited_id = :userId)) AND friend.confirm = :confirm)',
      {userId, friendId, confirm: true})
    const found = await query.delete().execute()
    if (found.affected === 0) {
      throw new NotFoundException("There is no friend with this id")
    }
  }
}