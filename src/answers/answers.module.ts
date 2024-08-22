import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Answer, AnswerSchema } from '../database/schemas/answer.schema';
import { Question, QuestionSchema } from '../database/schemas/question.schema';
import { User, UserSchema } from '../database/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Answer.name,
        schema: AnswerSchema,
      },
      {
        name: Question.name,
        schema: QuestionSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}
