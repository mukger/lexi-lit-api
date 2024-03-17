import { IsEmail, IsEnum, IsNotEmpty, Length, Matches, MaxLength, IsOptional } from "class-validator";
import { LanguagesList } from "src/data/languages-list";
import { passwordRegEx } from "src/data/password-regex";

export class SignInCredentialsDto {
    @IsNotEmpty()
    loginOrEmail: string;

    @IsNotEmpty()
    password: string;
}