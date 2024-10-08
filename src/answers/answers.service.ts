import { Injectable, Logger } from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Answer } from '../database/schemas/answer.schema';
import { Model } from 'mongoose';
import { Question } from '../database/schemas/question.schema';
import { GetAllAnswersDto } from './dto/get-all-answers.dto';
import { User } from '../database/schemas/user.schema';
import { AnswerVoteDto } from './dto/answer-vote-dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<Answer>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createAnswerDto: CreateAnswerDto) {
    try {
      const newAnswer = await this.answerModel.create({
        content: createAnswerDto.content,
        author: createAnswerDto.author,
        question: createAnswerDto.question,
      });
      await this.questionModel.findByIdAndUpdate(createAnswerDto.question, {
        $push: { answers: newAnswer._id },
      });

      return newAnswer;
    } catch (error) {
      Logger.error('can not create answer', error);
      console.log('error', error);
      throw error;
    }
  }

  async findAll(getAllAnswersDto: GetAllAnswersDto) {
    const { questionId, page = 1, pageSize = 10 } = getAllAnswersDto;

    const skipAmount = (page - 1) * pageSize;

    const answers = await this.answerModel
      .find({
        question: getAllAnswersDto.questionId,
      })
      .populate({
        path: 'author',
        model: this.userModel,
        select: '_id clerkId name picture',
      })
      // .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalAnswer = await this.answerModel.countDocuments({
      question: questionId,
    });

    const isNextAnswer = totalAnswer > skipAmount + answers.length;

    return { answers, isNextAnswer };
  }

  findOne(id: number) {
    return `This action returns a #${id} answer`;
  }

  async upvoteAnswer(answerVoteDto: AnswerVoteDto) {
    const { answerId, userId, hasupVoted, hasdownVoted } = answerVoteDto;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }

    const answer = await this.answerModel.findByIdAndUpdate(
      answerId,
      updateQuery,
      { new: true },
    );

    if (!answer) {
      throw new Error('Answer not found');
    }

    // TODO  Increment author's reputation

    return answer;
  }

  async downvoteAnswer(answerVoteDto: AnswerVoteDto) {
    const { answerId, userId, hasupVoted, hasdownVoted } = answerVoteDto;

    let updateQuery = {};

    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }

    const answer = await this.answerModel.findByIdAndUpdate(
      answerId,
      updateQuery,
      { new: true },
    );

    if (!answer) {
      throw new Error('Answer not found');
    }

    // TODO  Increment author's reputation

    return answer;
  }

  update(id: number, updateAnswerDto: UpdateAnswerDto) {
    return `This action updates a #${id} answer`;
  }

  remove(id: number) {
    return `This action removes a #${id} answer`;
  }
}
