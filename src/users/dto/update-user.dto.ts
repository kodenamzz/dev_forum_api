import { PartialType } from '@nestjs/mapped-types';
// import { CreateUserDto } from './create-user.dto';
import { User } from '../../database/schemas/user.schema';

export class UpdateUserDto extends PartialType(User) {}
