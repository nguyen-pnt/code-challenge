import { Transform, Type } from 'class-transformer';
import { IsString, IsOptional, Min } from 'class-validator';

export class QueryResourceDto {
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  category?: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Offset must be at least 0' })
  offset?: number;
}
