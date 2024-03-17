import { Body, Controller, Post, HttpCode, HttpStatus, Delete, Param } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Language } from './language.entity';
import { AddLanguageDto } from './dto/add-language.dto';
import * as uuidValidate from 'uuid-validate';
import { BadRequestException } from '@nestjs/common';
import { CheckUuidGuard } from 'src/guards/check-uuid.guard';

@Controller('languages')
@UseGuards(JwtAuthGuard, RolesGuard, CheckUuidGuard)
export class LanguagesController {
    constructor(private languagesService: LanguagesService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    //@Roles('owner')
    addLanguage(@Body() addLanguageDto: AddLanguageDto): Promise<Language> {
        return this.languagesService.addLanguage(addLanguageDto)
    }

    @Delete('/:languageId')
    @HttpCode(HttpStatus.NO_CONTENT)
    //@Roles('owner')
    deleteLanguage(
        @Param('languageId') languageId: string
    ): Promise<void> {
        if (!uuidValidate(languageId)) {
            throw new BadRequestException('Invalid bookId');
        }
        return this.languagesService.deleteLanguage(languageId)
    }
}
