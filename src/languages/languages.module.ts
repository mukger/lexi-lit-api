import { Module } from '@nestjs/common';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './language.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BooksModule } from 'src/books/books.module';
import { LanguagesRepository } from './languages.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language]),
    AuthModule
  ],
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguagesRepository]
})
export class LanguagesModule {}
