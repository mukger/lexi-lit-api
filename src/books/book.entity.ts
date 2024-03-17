import { User } from "src/auth/user.entity";
import { Language } from "src/languages/language.entity";
import { Column, Entity, ManyToOne, OneToMany, JoinColumn, Unique } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm";
import { IsNumber, Min, Max } from "class-validator";
import { LearnedWord } from "src/learned-words/learned-word.entity";
import { Exclude } from "class-transformer";

@Entity()
@Unique(["isbn", "user", "language"])
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true, length: 13})
    isbn: string;

    @Column({length: 512})
    book_file: string;

    @ManyToOne(_type => User, user => user.books, { eager: false })
    @JoinColumn({ name: 'user_id' })
    @Exclude({toPlainOnly: true})
    user: User;

    @ManyToOne(_type => Language, language => language.id, { eager: false })
    @JoinColumn({ name: 'language_id' })
    @Exclude({toPlainOnly: true})
    language: Language;

    @OneToMany(_type => LearnedWord, learnedWord => learnedWord.book, {eager: false})
    learnedWords: LearnedWord[];

    @Column({ type: 'float', default: 0 })
    @IsNumber()
    @Min(0)
    @Max(100)
    progress_percentage: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    start_reading_date: Date;

    @Column({ type: 'timestamp', nullable: true})
    finish_reading_date: Date;

    @Column({ type: 'float', default: 0 })
    @IsNumber() 
    reading_time: number;

    @Column({type: 'boolean', default: true})
    is_visible: boolean;
}