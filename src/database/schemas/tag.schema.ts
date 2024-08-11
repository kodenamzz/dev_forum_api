import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Question } from './question.schema';
import { User } from './user.schema';

export type TagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }])
  questions: Question[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  followers: User[];

  @Prop({ default: Date.now })
  createdOn: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
