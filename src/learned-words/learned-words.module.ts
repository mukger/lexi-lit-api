import { Module } from '@nestjs/common';
import { LearnedWordsController } from './learned-words.controller';
import { LearnedWordsService } from './learned-words.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearnedWord } from './learned-word.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BooksModule } from 'src/books/books.module';
import { LearnedWordsRepository } from './learned-words.repository';
import { Book } from 'src/books/book.entity';
import { BooksRepository } from 'src/books/books.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearnedWord, Book]),
    AuthModule
  ],
  controllers: [LearnedWordsController],
  providers: [LearnedWordsService, LearnedWordsRepository, BooksRepository]
})
export class LearnedWordsModule {}
