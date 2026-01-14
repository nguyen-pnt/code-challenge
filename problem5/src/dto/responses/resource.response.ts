import { Expose, Transform } from 'class-transformer';

export class ResourceResponse {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  category: string;

  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  createdAt: string;

  @Expose()
  @Transform(({ value }) => value instanceof Date ? value.toISOString() : value)
  updatedAt: string;
}
