import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { Tag } from './tag.schema';
import { Answer } from './answer.schema';

export type QuestionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }])
  tags: Tag[];

  @Prop({ default: 0 })
  view: number;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  upvotes: User[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  downvotes: User[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: User;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }])
  answer: Answer[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
