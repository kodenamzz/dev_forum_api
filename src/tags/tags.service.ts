import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { GetAllTagsDto } from './dto/get-all-tags.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Tag } from '../database/schemas/tag.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<Tag>) {}

  create(createTagDto: CreateTagDto) {
    return 'This action adds a new tag';
  }

  async findAll(getAllTagsDto: GetAllTagsDto) {
    try {
      const { searchQuery, filter, page = 1, pageSize = 10 } = getAllTagsDto;
      const skipAmount = (page - 1) * pageSize;

      // prepare query

      const query: FilterQuery<typeof Tag> = {};

      if (searchQuery) {
        const escapedSearchQuery = searchQuery.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&',
        );
        query.$or = [{ name: { $regex: new RegExp(escapedSearchQuery, 'i') } }];
      }

      let sortOptions = {};

      switch (filter) {
        case 'popular':
          sortOptions = { questions: -1 };
          break;
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'name':
          sortOptions = { name: 1 };
          break;
        case 'old':
          sortOptions = { createdAt: 1 };
          break;

        default:
          break;
      }

      const totalTags = await this.tagModel.countDocuments(query);
      const tags = await this.tagModel
        .find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);
      const isNext = totalTags > skipAmount + tags.length;
      return { tags, isNext };
    } catch (error) {
      Logger.error('something went wrong with get tags', error);
      throw new HttpException(
        'Something went wrong please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
