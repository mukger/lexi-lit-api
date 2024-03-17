import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BooksRepository } from './books.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LanguagesModule } from 'src/languages/languages.module';
import { LanguagesRepository } from 'src/languages/languages.repository';
import { Language } from 'src/languages/language.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Language]),
    AuthModule
  ],
  controllers: [BooksController],
  providers: [BooksService, BooksRepository, LanguagesRepository],
})
export class BooksModule {}
