import { IsNotEmpty, IsUUID } from "class-validator";
import { Matches } from "class-validator";
import { IsbnRegex } from "src/data/isbn-regex";

export class AddBookDto {
    @Matches(IsbnRegex, {
        message: 'Incorrect ISBN template'
    })
    @IsNotEmpty()
    isbn: string;

    @IsNotEmpty()
    bookFile: string;

    @IsNotEmpty()
    @IsUUID()
    languageId: string;
}