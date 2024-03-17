import { Controller, Delete, Param, Patch, Post, UseGuards, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Friend } from './friend.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CheckUuidGuard } from 'src/guards/check-uuid.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard, RolesGuard, CheckUuidGuard)
export class FriendsController {
    constructor(private friendsService: FriendsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    getFriends(
        @GetUser() user: User
    ): Promise<User[]> {
        return this.friendsService.getFriends(user)
    }

    @Get('/invites')
    @HttpCode(HttpStatus.OK)
    getFriendInBoxInvitations(
        @GetUser() user: User,
    ): Promise<User[]> {
        return this.friendsService.getFriendInboxInvitations(user)
    }

    @Get('/requests')
    @HttpCode(HttpStatus.OK)
    getFriendoutboxInvitations(
        @GetUser() user: User,
    ): Promise<User[]> {
        return this.friendsService.getFriendOutboxInvitations(user)
    }

    @Post('/invite/:friendId')
    @HttpCode(HttpStatus.CREATED) 
    inviteFriend(
        @GetUser() user: User,
        @Param('friendId') friendId: string
    ): Promise<Friend> {
        return this.friendsService.inviteFriend(user, friendId)
    }

    @Patch('/accept/:friendId')
    @HttpCode(HttpStatus.OK)
    acceptFriendInvitation(
        @GetUser() user: User,
        @Param('friendId') friendId: string
    ): Promise<Friend> {
        return this.friendsService.acceptFriendInvitation(user, friendId)
    }

    @Patch('/view/:friendId')
    @HttpCode(HttpStatus.OK)
    viewFriendInvitation(
        @GetUser() user: User,
        @Param('friendId') friendId: string
    ): Promise<Friend> {
        return this.friendsService.viewFriendInvitation(user, friendId)
    }

    @Delete('/requests/:friendId')
    @HttpCode(HttpStatus.NO_CONTENT)
    rejectFriendOutboxInvitation(
        @GetUser() user: User,
        @Param('friendId') friendId: string
    ): Promise<void> {
        return this.friendsService.rejectFriendOutboxInvitation(user, friendId)
    }

    @Delete('/invites/:friendId')
    @HttpCode(HttpStatus.NO_CONTENT)
    rejectFriendInboxInvitation(
        @GetUser() user: User,
        @Param('friendId') friendId: string
    ): Promise<void> {
        return this.friendsService.rejectFriendInboxInvitation(user, friendId)
    }

    @Delete('/:friendId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteFriend(
        @GetUser() user: User,
        @Param('friendId') friendId: string
    ): Promise<void> {
        return this.friendsService.deleteFriend(user, friendId)
    }
}
