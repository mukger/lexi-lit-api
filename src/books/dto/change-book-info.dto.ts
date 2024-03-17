import { IsNotEmpty, IsOptional, Matches } from "class-validator";
import { IsbnRegex } from "src/data/isbn-regex";

export class ChangeBookInfoDto {
    @Matches(IsbnRegex, {
        message: 'Incorrect ISBN template'
    })
    @IsOptional()
    isbn?: string;

    @IsOptional()
    bookFile?: string;

    @IsOptional()
    isVisible?: boolean;
}