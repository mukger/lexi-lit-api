import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendsRepository } from './friends.repository';
import { User } from 'src/auth/user.entity';
import { Friend } from './friend.entity';
import * as uuidValidate from 'uuid-validate';

@Injectable()
export class FriendsService {
    constructor(
        @InjectRepository(FriendsRepository)
        private readonly friendsRepository: FriendsRepository
    ) {}

    async getFriends(user: User): Promise<User[]> {
        const { id: userId } = user
        return this.friendsRepository.getConfirmedFriends(userId)
    }

    async getFriendOutboxInvitations(user: User): Promise<User[]> {
        const { id: userId } = user
        return this.friendsRepository.getUnconfirmedInvitedFriends(userId)
    }

    async getFriendInboxInvitations(user: User): Promise<User[]> {
        const { id: userId } = user
        return this.friendsRepository.getUnconfirmedInitiatorFriends(userId)
    }

    async inviteFriend(user: User, friendId: string): Promise<Friend> {
        if (user.id === friendId) {
            throw new BadRequestException("You can't add yourself like a friend")
        }
        return this.friendsRepository.createFriend(user.id, friendId)
    }

    async acceptFriendInvitation(user: User, friendId: string): Promise<Friend> {
        const initiatorId = friendId
        const { id: invitedId } = user
        const found = await this.friendsRepository.findFriend(initiatorId, invitedId)
        if (!found) {
            throw new NotFoundException(`There is no invitation from user "${initiatorId}" to user "${invitedId}"`)
        }

        found.checked = true
        found.confirm = true

        try {
            await this.friendsRepository.save(found)
        } catch(error) {
            throw new InternalServerErrorException("Ooops... Something went wrong...")
        }
        
        return found
    }

    async viewFriendInvitation(user: User, friendId: string): Promise<Friend> {
        const initiatorId = friendId
        const { id: invitedId } = user
        const found = await this.friendsRepository.findFriend(initiatorId, invitedId)
        if (!found) {
            throw new NotFoundException(`There is no invitation from user "${initiatorId}" to user "${invitedId}"`)
        }

        found.checked = true

        try {
            await this.friendsRepository.save(found)
        } catch(error) {
            throw new InternalServerErrorException("Ooops... Something went wrong...")
        }
        
        return found
    }

    async rejectFriendOutboxInvitation(user: User, friendId: string): Promise<void> {
        const { id: userId} = user
        await this.friendsRepository.deleteUnconfirmedInvitedFriend(userId, friendId)
    }

    async rejectFriendInboxInvitation(user: User, friendId: string): Promise<void> {
        const { id: userId } = user
        await this.friendsRepository.deleteUnconfirmedInitiatorFriend(userId, friendId)
    }

    async deleteFriend(user: User, friendId: string): Promise<void> {
        const { id: userId} = user
        await this.friendsRepository.deleteConfirmedFriend(userId, friendId)
    }
}
