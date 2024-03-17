import { Repository } from "typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Book } from "./book.entity";
import { AddBookDto } from "./dto/add-book.dto";
import { Language } from "src/languages/language.entity";
import { User } from "src/auth/user.entity";
import { ConflictException } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";
import { ChangeBookInfoDto } from "./dto/change-book-info.dto";

@Injectable()
export class BooksRepository extends Repository<Book> {
  constructor(private dataSource: DataSource) {
    super(Book, dataSource.createEntityManager());
  }

  async createBook(addBookDto: AddBookDto, language: Language, user: User): Promise<Book> {
    const { isbn, bookFile } = addBookDto
    const book = this.create({
      isbn,
      book_file: bookFile,
      language,
      user,
      is_visible: false
    })

    try {
      await this.save(book)
    } catch (error) {
      if (+error.code === 23505) {
        throw new ConflictException('You already added this book')
      } else {
        console.log(error)
        throw new InternalServerErrorException("Ooops... Something went wrong...")
      }
    }

    return book
  }

  async getBooksByUserId(userId: string): Promise<Book[]> {
    const query = this.createQueryBuilder('book')
    query.andWhere('(book.user_id = :userId)', { userId })
    return query.getMany()
  }

  async getAllVisibleBooks(): Promise<Book[]> {
    const query = this.createQueryBuilder('book')
    query.andWhere('book.is_visible = :is_visible', { is_visible: true})
    return query.getMany()
  }

  async getUserBookById(userId: string, bookId: string): Promise<Book> {
    const query = this.createQueryBuilder('book')
    query.andWhere('(book.id = :bookId AND book.user_id = :userId)', {bookId, userId})
    return query.getOne()
  }

  async changeBookById(
    bookId: string,
    changeBookInfoDto: ChangeBookInfoDto,
    userId: string
  ): Promise<Book> {
    const { isbn, bookFile, isVisible } = changeBookInfoDto
    const query = this.createQueryBuilder('book')
    query.andWhere('(book.id = :bookId and book.user_id = :userId)', {bookId, userId})
    const found = await query.getOne()
    if (!found) {
      throw new NotFoundException("There is no book with this id")
    }
    if (isbn) {
      found.isbn = isbn
    }
    if (bookFile) {
      found.book_file = bookFile
    }
    if (isVisible) {
      found.is_visible = isVisible
    }

    try {
      await this.save(found)
    } catch (error) {
      if (+error.code === 23505) {
          throw new ConflictException('You already have book with given isbn')
      } else {
          throw new InternalServerErrorException("Ooops... Something went wrong...")
      }
    }

    return found
  }

  async deleteBookById(bookId: string, userId: string): Promise<void> {
    const query = this.createQueryBuilder('book')
    query.andWhere('(book.id = :bookId and book.user_id = :userId)', {bookId, userId})
    const found = await query.delete().execute()
    if (found.affected === 0) {
      throw new NotFoundException("There is no book with this id")
    }
  }
}