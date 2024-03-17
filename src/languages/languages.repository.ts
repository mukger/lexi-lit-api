import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Language } from "./language.entity";
import { AddLanguageDto } from "./dto/add-language.dto";
import { LanguagesList } from "src/data/languages-list";
import { ConflictException } from "@nestjs/common";
import { InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class LanguagesRepository extends Repository<Language> {
  constructor(private dataSource: DataSource) {
    super(Language, dataSource.createEntityManager());
  }

  async createLanguage(addLanguageDto: AddLanguageDto): Promise<Language> {
    const { languageCode } = addLanguageDto
    const language = this.create({
      language_code: languageCode,
      language_name: LanguagesList[languageCode]
    })

    try {
      await this.save(language)
    } catch (error) {
      if (+error.code === 23505) {
        throw new ConflictException('This language is already exists in active educational list')
      } else {
        throw new InternalServerErrorException("Ooops... Something went wrong...")
      }
    }

    return language
  }

}