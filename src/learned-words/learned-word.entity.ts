import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, BeforeInsert } from "typeorm";
import { Book } from "src/books/book.entity";
import { Min } from "class-validator";
import { Exclude } from "class-transformer";

@Entity()
@Unique(["book", "word"])
export class LearnedWord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(_type => Book, book => book.learnedWords, { eager: false })
    @JoinColumn({ name: 'book_id' })
    @Exclude({toPlainOnly: true})
    book: Book;

    @Column({length: 45})
    word: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date_of_learning: Date;

    @Column({type: 'int', default: 0})
    @Min(0)
    attempts: number;

    @Column({type: 'int', default: 0})
    @Min(0)
    successful_attempts: number;
}