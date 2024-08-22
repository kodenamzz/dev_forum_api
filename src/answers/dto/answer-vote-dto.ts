import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class AnswerVoteDto {
  @IsString()
  @IsNotEmpty()
  answerId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsBoolean()
  hasupVoted: boolean;

  @IsBoolean()
  hasdownVoted: boolean;
}
