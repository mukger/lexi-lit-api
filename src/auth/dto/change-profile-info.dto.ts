import { IsEmail, IsEnum, IsNotEmpty, IsOptional, Length, Matches, MaxLength } from "class-validator";
import { LanguagesList } from "src/data/languages-list";

export class ChangeProfileInfoDto {
    @Length(4, 20)
    @IsOptional()
    login?: string;

    @IsEmail()
    @MaxLength(50)
    @IsOptional()
    email?: string;

    @IsEnum(LanguagesList)
    @IsOptional()
    nativeLanguage?: LanguagesList;
}