import { IsNotEmpty } from "class-validator";

export class AddLanguageDto {
    @IsNotEmpty()
    languageCode: string;
}