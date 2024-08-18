import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './user.schema';
import { Tag } from './tag.schema';
import { Answer } from './answer.schema';
import { Question } from './question.schema';

export type InteractionDocument = HydratedDocument<Interaction>;

@Schema()
export class Interaction {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  action: String;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Question' })
  question: Question;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' })
  answer: Answer;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }])
  tags: Tag[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);
