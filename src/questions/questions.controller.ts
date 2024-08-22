import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
  Put,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Response } from 'express';
import { QuestionDocument } from '../database/schemas/question.schema';
import { ClerkAuthGuard } from '../clerk-auth/clerk-auth.guard';
import { QuestionVoteDto } from './dto/question-vote-dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Res() res: Response,
  ) {
    try {
      const question: QuestionDocument =
        await this.questionsService.create(createQuestionDto);
      res.status(HttpStatus.CREATED).send({ question });
    } catch (error) {
      throw new HttpException(
        'Something went wrong please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') questionId: string) {
    return this.questionsService.findOne(questionId);
  }

  @Put('upvote')
  async upvoteQuestion(
    @Body() questionVoteDto: QuestionVoteDto,
    @Res() res: Response,
  ) {
    try {
      const question =
        await this.questionsService.upvoteQuestion(questionVoteDto);
      res.status(HttpStatus.OK).send(question);
    } catch (error) {
      throw new HttpException(
        'Something went wrong please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Put('downvote')
  async downvoteQuestion(
    @Body() questionVoteDto: QuestionVoteDto,
    @Res() res: Response,
  ) {
    try {
      const question =
        await this.questionsService.downvoteQuestion(questionVoteDto);
      res.status(HttpStatus.OK).send(question);
    } catch (error) {
      throw new HttpException(
        'Something went wrong please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') questionId: string) {
    return this.questionsService.remove(questionId);
  }
}
