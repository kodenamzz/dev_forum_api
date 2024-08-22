import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AnswerDocument } from '../database/schemas/answer.schema';
import { Response } from 'express';
import { GetAllAnswersDto } from './dto/get-all-answers.dto';
import { ClerkAuthGuard } from 'src/clerk-auth/clerk-auth.guard';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  async create(@Body() createAnswerDto: CreateAnswerDto, @Res() res: Response) {
    try {
      const answer: AnswerDocument =
        await this.answersService.create(createAnswerDto);
      res.status(HttpStatus.CREATED).send({ answer });
    } catch (error) {
      throw new HttpException(
        'Something went wrong please try again later',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  findAll(@Query() query: GetAllAnswersDto) {
    return this.answersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answersService.update(+id, updateAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answersService.remove(+id);
  }
}
