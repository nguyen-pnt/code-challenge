import { Transform } from 'class-transformer';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateResourceDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(1, { message: 'Name must be at least 1 character long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description must be at least 1 character long' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string;

  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @MinLength(1, { message: 'Category must be at least 1 character long' })
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  category?: string;
}
