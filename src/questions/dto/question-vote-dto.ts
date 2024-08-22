import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class QuestionVoteDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsBoolean()
  hasupVoted: boolean;

  @IsBoolean()
  hasdownVoted: boolean;
}
