import { IsEmail, IsEnum, IsNotEmpty, Length, Matches, MaxLength } from "class-validator";
import { LanguagesList } from "src/data/languages-list";
import { passwordRegEx } from "src/data/password-regex";

export class SignUpCredentialsDto {
    @Length(4, 20)
    @IsNotEmpty()
    login: string;

    @IsEmail()
    @MaxLength(50)
    @IsNotEmpty()
    email: string;

    @Matches(passwordRegEx, {
        message: 'password is too weak'
    })
    @Length(6, 24)
    @IsNotEmpty()
    password: string;

    @IsEnum(LanguagesList)
    nativeLanguage: LanguagesList;
}