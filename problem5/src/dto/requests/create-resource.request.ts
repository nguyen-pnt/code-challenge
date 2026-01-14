import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateResourceDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(1, { message: 'Description must be at least 1 character long' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description: string;

  @IsString({ message: 'Category must be a string' })
  @IsNotEmpty({ message: 'Category is required' })
  @MinLength(1, { message: 'Category must be at least 1 character long' })
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  category: string;
}
