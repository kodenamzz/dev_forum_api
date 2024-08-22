import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Question } from './question.schema';
import { User } from './user.schema';

export type AnswerDocument = HydratedDocument<Answer>;

@Schema()
export class Answer {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  author: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  })
  question: Question;

  @Prop({ required: true })
  content: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  upvotes: User[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  downvotes: User[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
