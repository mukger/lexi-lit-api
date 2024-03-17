import { Body, Controller, Delete, Get, Param, Post, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './book.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AddBookDto } from './dto/add-book.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { Roles } from 'src/auth/meta-data-roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ChangeBookInfoDto } from './dto/change-book-info.dto';
import { CheckUuidGuard } from 'src/guards/check-uuid.guard';

@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard, CheckUuidGuard)
export class BooksController {
    constructor(private booksService: BooksService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    //@Roles('user')
    addBook(
        @Body() addBookDto: AddBookDto,
        @GetUser() user: User
    ): Promise<Book> {
        return this.booksService.addBook(addBookDto, user)
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    getUserBooks(
        @GetUser() user: User
    ): Promise<Book[]> {
        return this.booksService.getUserBooks(user)
    }

    @Get('/all')
    @HttpCode(HttpStatus.OK)
    GetAllBooks(): Promise<Book[]> {
        return this.booksService.getAllBooks()
    }

    @Patch('/:bookId')
    @HttpCode(HttpStatus.CREATED)
    changeBookInfo(
        @Param('bookId') bookId: string,
        @Body() changeBookInfoDto: ChangeBookInfoDto,
        @GetUser() user: User
    ): Promise<Book> {
        return this.booksService.changeBookInfo(bookId, changeBookInfoDto, user)
    }

    @Delete('/:bookId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteUserBook(
        @Param('bookId') bookId: string, 
        @GetUser() user: User
    ): Promise<void> {
        return this.booksService.deleteUserBook(user, bookId)
    }
}
