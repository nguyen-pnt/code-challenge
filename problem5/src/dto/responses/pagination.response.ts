import { Expose, Type } from 'class-transformer';
import { ResourceResponse } from './resource.response';

export class PaginationMeta {
  @Expose()
  total: number;

  @Expose()
  limit: number;

  @Expose()
  offset: number;

  @Expose()
  hasMore: boolean;

  @Expose()
  page: number;

  @Expose()
  totalPages: number;
}

export class PaginatedResourceResponse {
  @Expose()
  @Type(() => ResourceResponse)
  data: ResourceResponse[];

  @Expose()
  @Type(() => PaginationMeta)
  pagination: PaginationMeta;

  static create(
    resources: ResourceResponse[], 
    total: number, 
    limit: number = 10, 
    offset: number = 0
  ): PaginatedResourceResponse {
    const pagination: PaginationMeta = {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
    
    const response = new PaginatedResourceResponse();
    response.data = resources;
    response.pagination = pagination;
    return response;
  }
}