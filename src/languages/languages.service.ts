import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LanguagesRepository } from './languages.repository';
import { AddLanguageDto } from './dto/add-language.dto';
import { Language } from './language.entity';

@Injectable()
export class LanguagesService {
    constructor(
        @InjectRepository(LanguagesRepository)
        private readonly languagesRepository: LanguagesRepository
    ) {}

    async addLanguage(addLanguageDto: AddLanguageDto): Promise<Language> {
        return this.languagesRepository.createLanguage(addLanguageDto)
    }

    async deleteLanguage(languageId: string): Promise<void> {
       const result = await this.languagesRepository.delete(languageId)
       if (result.affected === 0) {
        throw new NotFoundException("There is no language with this id")
       }
    }
}
