import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagSchema } from '../database/schemas/tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Tag.name,
        schema: TagSchema,
      },
    ]),
  ],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
