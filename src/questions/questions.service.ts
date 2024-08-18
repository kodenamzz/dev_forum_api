import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from '../database/schemas/question.schema';
import { Model } from 'mongoose';
import { Tag } from '../database/schemas/tag.schema';
import { User } from '../database/schemas/user.schema';
import { Answer } from 'src/database/schemas/answer.schema';
import { Interaction } from 'src/database/schemas/Interaction.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Answer.name) private answerModel: Model<Answer>,
    @InjectModel(Interaction.name) private interactionModel: Model<Interaction>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const { tags, ...newQuestion } = createQuestionDto;

    try {
      const question = await this.questionModel.create(newQuestion);

      const tagDocuments = [];

      for (const tag of tags) {
        const existingTag = await this.tagModel.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
          { $setOnInsert: { name: tag }, $push: { questions: question._id } },
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

  async findAll(): Promise<Question[]> {
    return await this.questionModel
      .find({})
      .populate({ path: 'tags', model: this.tagModel })
      .populate({ path: 'author', model: this.userModel })
      .sort({ createdAt: -1 });
  }

  async findOne(questionId: string) {
    return await this.questionModel
      .findById(questionId)
      .populate({ path: 'tags', model: this.tagModel, select: '_id name' })
      .populate({
        path: 'author',
        model: this.userModel,
        select: '_id clerkId name picture',
      });
  }

  update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return `This action updates a #${id} question`;
  }

  async remove(questionId: string) {
    try {
      await this.questionModel.deleteOne({ _id: questionId });
      await this.answerModel.deleteMany({ question: questionId });
      await this.interactionModel.deleteMany({ question: questionId });
      await this.tagModel.updateMany(
        { questions: questionId },
        { $pull: { questions: questionId } },
      );
    } catch (error) {
      Logger.error('can not remove question', error);
      throw error;
    }
  }
}
