import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  clerkId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  picture: string;
}
