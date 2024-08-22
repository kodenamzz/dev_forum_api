import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from '../database/schemas/question.schema';
import { Tag, TagSchema } from '../database/schemas/tag.schema';
import { User, UserSchema } from '../database/schemas/user.schema';
import {
  Interaction,
  InteractionSchema,
} from '../database/schemas/Interaction.schema';
import { Answer, AnswerSchema } from '../database/schemas/answer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Question.name,
        schema: QuestionSchema,
      },
      {
        name: Tag.name,
        schema: TagSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Answer.name,
        schema: AnswerSchema,
      },
      {
        name: Interaction.name,
        schema: InteractionSchema,
      },
    ]),
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
