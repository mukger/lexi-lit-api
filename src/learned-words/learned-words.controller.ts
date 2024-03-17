import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards, Patch, Query } from '@nestjs/common';
import { LearnedWordsService } from './learned-words.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { LearnedWord } from './learned-word.entity';
import { User } from 'src/auth/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { AddLearnedWordDto } from './dto/add-learned-word.dto';
import { CheckUuidGuard } from 'src/guards/check-uuid.guard';

@Controller('learned-words')
@UseGuards(JwtAuthGuard, RolesGuard, CheckUuidGuard)
export class LearnedWordsController {
    constructor(private learnedWordsService: LearnedWordsService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    getLearnedWords(
        @GetUser() user: User
    ): Promise<LearnedWord[]> { 
        return this.learnedWordsService.getLearnedWords(user)
    }

    @Get('/:learnedWordId')
    @HttpCode(HttpStatus.OK)
    getLearnedWordById(
        @Param('learnedWordId') learnedWordId: string,
        @GetUser() user: User
    ): Promise<LearnedWord> {
        return this.learnedWordsService.getLearnedWordById(user, learnedWordId)
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    addLearnedWord(
        @Body() addLearnedWordDto: AddLearnedWordDto,
        @GetUser() user: User
    ): Promise<LearnedWord> {
        return this.learnedWordsService.addLearnedWord(user, addLearnedWordDto)
    }

    @Patch('/answer/:learnedWordId')
    @HttpCode(HttpStatus.OK)
    checkLearnedWord(
        @Param('learnedWordId') learnedWordId: string,
        @Query('right') right: string,
        @GetUser() user: User
    ): Promise<LearnedWord> {
        return this.learnedWordsService.checkLearnedWord(user, learnedWordId, right)
    }

    @Delete('/:learnedWordId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteLearnedWord(
        @Param('learnedWordId') learnedWordId: string,
        @GetUser() user: User
    ): Promise<void> {
        return this.learnedWordsService.deleteLearnedWord(user, learnedWordId)
    }
}
