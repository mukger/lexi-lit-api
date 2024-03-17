import { Book } from "src/books/book.entity";
import { LanguagesList } from "src/data/languages-list";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { LearnedWord } from "src/learned-words/learned-word.entity";
import { UsersRoles } from "src/data/users-roles";
import { Friend } from "src/friends/friend.entity";
import { Exclude } from "class-transformer";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    @Exclude({toPlainOnly: true})
    id: string;

    @Column({unique: true, length: 20})
    login: string;

    @Column({unique: true, length: 50})
    email: string;

    @Column({length: 60})
    @Exclude({toPlainOnly: true})
    password: string;

    @Column({
        type: "enum",
        enum: LanguagesList,
        nullable: true
    })
    native_language: LanguagesList;

    @Column({
        type: "enum",
        enum: UsersRoles,
        default: UsersRoles.USER
    })
    role: UsersRoles

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    registration_date: Date;

    @OneToMany(_type => Book, book => book.user, {eager: false})
    books: Book[];

    @OneToMany(_type => Friend, friend => friend.initiator, {eager: false})
    friend_requests: Friend[];

    @OneToMany(_type => Friend, friend => friend.invited, {eager: false})
    friend_invites: Friend[];
}