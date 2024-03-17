import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './friend.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FriendsRepository } from './friends.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend]),
    AuthModule
  ],
  controllers: [FriendsController],
  providers: [FriendsService, FriendsRepository]
})
export class FriendsModule {}
