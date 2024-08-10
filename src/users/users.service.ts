import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../database/schemas/user.schema';
import { Model } from 'mongoose';
import { Question } from '../database/schemas/question.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.userModel.create(createUserDto);
      return newUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findOne({
        clerkId: id,
      });
      return user;
    } catch (error) {
      Logger.error('something went wrong with get user', error);
      throw new HttpException(
        'Something went wrong please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    try {
      const { clerkId } = updateUserDto;
      await this.userModel.findOneAndUpdate({ clerkId }, updateUserDto, {
        new: true,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteUser(clerkId: string) {
    try {
      const user = await this.userModel.findOneAndDelete({ clerkId });

      if (!user) {
        throw new Error('User not found');
      }

      // Delete user from database
      // and questions, answers, comments, etc.

      // get user question ids
      // const userQuestionIds = await Question.find({ author: user._id}).distinct('_id');

      // delete user questions
      await this.questionModel.deleteMany({ author: user._id });

      // TODO: delete user answers, comments, etc.

      const deletedUser = await this.userModel.findByIdAndDelete(user._id);

      return deletedUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
