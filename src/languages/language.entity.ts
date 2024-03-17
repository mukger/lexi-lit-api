import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Book } from "src/books/book.entity";

@Entity()
export class Language {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    language_name: string;

    @Column({unique: true, length: 2})
    language_code: string;

    @OneToMany(_type => Book, book => book.language, {eager: false})
    books: Book[];
}