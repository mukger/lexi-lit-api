import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LearnedWordsRepository } from './learned-words.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { LearnedWord } from './learned-word.entity';
import { User } from 'src/auth/user.entity';
import { AddLearnedWordDto } from './dto/add-learned-word.dto';
import { BooksRepository } from 'src/books/books.repository';

@Injectable()
export class LearnedWordsService {
    constructor(
        @InjectRepository(LearnedWordsRepository)
        private readonly learnedWordsRepository: LearnedWordsRepository,
        @InjectRepository(BooksRepository)
        private readonly booksRepository: BooksRepository
    ) {}

    async getLearnedWords(user: User): Promise<LearnedWord[]> {
        const { id: userId } = user
        return this.learnedWordsRepository.getLearnedWordsByUserId(userId)
    }

    async getLearnedWordById(user: User, learnedWordId: string): Promise<LearnedWord> {
        const { id: userId } = user
        return this.learnedWordsRepository.getLearnedWordById(userId, learnedWordId)
    }

    async addLearnedWord(user: User, addLearnedWordDto: AddLearnedWordDto): Promise<LearnedWord> {
        const { id: userId } = user
        const { bookId, word } = addLearnedWordDto
        const found = await this.booksRepository.getUserBookById(userId, bookId)
        if (!found) {
            throw new NotFoundException("There is no user's book with given id")
        }
        const check = await this.learnedWordsRepository.findLearnedWordByUser(userId, word)
        if (check) {
            throw new ConflictException("You already added this word in list of learned")
        }

        return this.learnedWordsRepository.createLearnedWord(addLearnedWordDto, found)
    }

    async checkLearnedWord(user: User, learnedWordId: string, right: string): Promise<LearnedWord> {
        const correctness = (typeof right === "string" && right.toLowerCase() === "true");
        const { id: userId } = user
        return this.learnedWordsRepository.increaseAttempsById(userId, learnedWordId, correctness)
    }

    async deleteLearnedWord(user: User, learnedWordId: string): Promise<void> {
        const { id: userId } = user
        return this.learnedWordsRepository.deleteLearnedWord(userId, learnedWordId)
    }
}
