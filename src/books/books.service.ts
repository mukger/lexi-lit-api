import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BooksRepository } from './books.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AddBookDto } from './dto/add-book.dto';
import { Book } from './book.entity';
import { User } from 'src/auth/user.entity';
import { LanguagesRepository } from 'src/languages/languages.repository';
import { ChangeBookInfoDto } from './dto/change-book-info.dto';
import * as uuidValidate from 'uuid-validate';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(BooksRepository)
        private readonly booksRepository: BooksRepository,
        @InjectRepository(LanguagesRepository)
        private readonly languagesRepository: LanguagesRepository,
    ) {}

    async addBook(addBookDto: AddBookDto, user: User): Promise<Book> {
        const { languageId } = addBookDto
        if (!uuidValidate(languageId)) {
            throw new BadRequestException('Invalid language id');
        }

        const language = await this.languagesRepository.findOneBy({ id: languageId })

        if (!language) {
            throw new NotFoundException("This language is unsupported by our server like an educational one yet")
        }

        return this.booksRepository.createBook(addBookDto, language, user)
    }

    async getUserBooks(user: User): Promise<Book[]> {
        return this.booksRepository.getBooksByUserId(user.id)
    }

    async getAllBooks(): Promise<Book[]> {
        return this.booksRepository.getAllVisibleBooks()
    }

    async changeBookInfo(bookId: string, changeBookInfoDto: ChangeBookInfoDto, user: User): Promise<Book> {
        const { id: userId } = user
        return this.booksRepository.changeBookById(bookId, changeBookInfoDto, userId)
    }

    async deleteUserBook(user: User, bookId: string): Promise<void> {
        const { id: userId } = user
        return this.booksRepository.deleteBookById(bookId, userId)
    }
}
