import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from 'src/database/schemas/question.schema';
import { Model } from 'mongoose';
import { Tag } from 'src/database/schemas/tag.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const { tags, ...newQuestion } = createQuestionDto;

    try {
      const question = await this.questionModel.create(newQuestion);

      const tagDocuments = [];

      for (const tag of tags) {
        const existingTag = await this.tagModel.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
          { $setOnInsert: { name: tag }, $push: { question: question._id } },
          { upsert: true, new: true },
        );

        tagDocuments.push(existingTag._id);
      }

      await this.questionModel.findByIdAndUpdate(question._id, {
        $push: { tags: { $each: tagDocuments } },
      });
      return question;
    } catch (error) {
      Logger.error('can not create question', error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all questions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} question`;
  }

  update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return `This action updates a #${id} question`;
  }

  remove(id: number) {
    return `This action removes a #${id} question`;
  }
}
