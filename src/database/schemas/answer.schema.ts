import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Question } from './question.schema';

export type AnswerDocument = HydratedDocument<Answer>;

@Schema()
export class Answer {
  @Prop({ required: true, unique: true })
  clerkId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  bio: string;

  @Prop({ required: true })
  picture: string;

  @Prop()
  location: string;

  @Prop()
  portfolioWebsite: string;

  @Prop({ default: 0 })
  reputation: number;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }])
  saved: Question[];

  @Prop({ default: Date.now })
  joinedAt: Date;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
