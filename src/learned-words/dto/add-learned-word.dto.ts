import { IsNotEmpty, IsUUID, Length } from "class-validator";

export class AddLearnedWordDto {
    @IsNotEmpty()
    @IsUUID()
    bookId: string;

    @IsNotEmpty()
    @Length(1, 45)
    word: string;
}