import { Repository, Not, IsNull } from "typeorm";
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { LearnedWord } from "./learned-word.entity";
import { AddLearnedWordDto } from "./dto/add-learned-word.dto";
import { Book } from "src/books/book.entity";


@Injectable()
export class LearnedWordsRepository extends Repository<LearnedWord> {
  constructor(private dataSource: DataSource) {
    super(LearnedWord, dataSource.createEntityManager());
  }

  async getLearnedWordsByUserId(userId: string): Promise<LearnedWord[]> {
    const result = await this.findBy({ book: { user: { id: userId } }})
    return result
  }

  async getLearnedWordById(userId: string, learnedWordId: string): Promise<LearnedWord> {
    const result = await this.findOneBy({id: learnedWordId, book: { user: { id: userId } }})
    if (!result) {
      throw new NotFoundException("There is no learned word with this id by currunt user")
    }
    return result
  }

  async createLearnedWord(addLearnedWordDto: AddLearnedWordDto, book: Book): Promise<LearnedWord> {
    const learnedWord = this.create({
      book,
      word: addLearnedWordDto.word
    })

    try {
      await this.save(learnedWord)
    } catch (error) {
      if (+error.code === 23505) {
        throw new ConflictException('You already added this word')
      } else {
        console.log(error)
        throw new InternalServerErrorException("Ooops... Something went wrong...")
      }
    }

    return learnedWord
  }

  async findLearnedWordByUser(userId: string, learnedWord: string): Promise<LearnedWord> {
    const result = await this.findOneBy({book: { user: { id: userId } }, word: learnedWord})
    return result
  }

  async increaseAttempsById(userId: string, learnedWordId: string, correctness: boolean): Promise<LearnedWord> {
    const found = await this.getLearnedWordById(userId, learnedWordId)
    const { attempts, successful_attempts} = found
    if (correctness) {
      found.successful_attempts = successful_attempts + 1
    }
    found.attempts = attempts + 1

    try {
      await this.save(found)
    } catch (error) {
      console.log(error)
        throw new InternalServerErrorException("Ooops... Something went wrong...")
    }

    return found
  }

  async deleteLearnedWord(userId: string, learnedWordId: string): Promise<void> {
    const result = await this.delete({ book: { id: Not(IsNull()), user: { id: userId } }, id: learnedWordId });
    if (result.affected === 0) {
      throw new NotFoundException("There is no learned word with this id by currunt user")
    }
  }
}