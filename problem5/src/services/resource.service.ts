import { plainToInstance } from 'class-transformer';
import { Repository, SelectQueryBuilder, DataSource } from 'typeorm';
import { AppDataSource } from '../config/database';
import { logger } from '../config/logging';
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto, ResourceResponse, PaginatedResourceResponse } from '../dto';
import { Resource } from '../entities/Resource';
import { NotFoundError } from '../middleware';

export class ResourceService {
  private resourceRepository: Repository<Resource>;

  constructor(dataSource?: DataSource) {
    const ds = dataSource || AppDataSource;
    this.resourceRepository = ds.getRepository(Resource);
  }

  async createResource(resourceData: CreateResourceDto): Promise<ResourceResponse> {
    try {
      logger.debug('Creating new resource', { resourceData });
      
      const resource = new Resource({
        name: resourceData.name,
        description: resourceData.description,
        category: resourceData.category
      });

      const savedResource = await this.resourceRepository.save(resource);
      
      logger.info('Resource created successfully', { id: savedResource.id });
      return plainToInstance(ResourceResponse, savedResource);
    } catch (error) {
      logger.error('Error creating resource', error, { resourceData });
      throw error;
    }
  }

  async getResources(filters: QueryResourceDto = {}): Promise<PaginatedResourceResponse> {
    try {
      logger.debug('Fetching resources with filters', { filters });
      
      const { category, name, limit = 10, offset = 0 } = filters;
      
      let query: SelectQueryBuilder<Resource> = this.resourceRepository
        .createQueryBuilder('resource');

      // Apply filters
      if (category) {
        query = query.andWhere('resource.category = :category', { category });
      }

      if (name) {
        query = query.andWhere('resource.name LIKE :name', { name: `%${name}%` });
      }

      // Apply pagination and ordering
      const [resources, total] = await query
        .orderBy('resource.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      logger.debug('Resources fetched successfully', { 
        count: resources.length, 
        total, 
        filters 
      });

      return plainToInstance(
        PaginatedResourceResponse,
        {
          data: resources,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit),
          }
        }
      )
    } catch (error) {
      logger.error('Error fetching resources', error, { filters });
      throw error;
    }
  }

  async getResourceById(id: number): Promise<ResourceResponse> {
    try {
      logger.debug('Fetching resource by ID', { id });
      
      const resource = await this.getAndThrow(id);

      logger.debug('Resource fetched successfully', { id });
      return plainToInstance(ResourceResponse, resource);
    } catch (error) {
      logger.error('Error fetching resource by ID', error, { id });
      throw error;
    }
  }

  async updateResource(id: number, updateData: UpdateResourceDto): Promise<ResourceResponse> {
    try {
      logger.debug('Updating resource', { id, updateData });
      
      const resource = await this.getAndThrow(id);

      // Update fields if provided
      if (updateData.name !== undefined) {
        resource.name = updateData.name;
      }
      if (updateData.description !== undefined) {
        resource.description = updateData.description;
      }
      if (updateData.category !== undefined) {
        resource.category = updateData.category;
      }

      const updatedResource = await this.resourceRepository.save(resource);
      
      logger.info('Resource updated successfully', { id });
      return plainToInstance(ResourceResponse, updatedResource);
    } catch (error) {
      logger.error('Error updating resource', error, { id, updateData });
      throw error;
    }
  }

  async deleteResource(id: number): Promise<void> {
    try {
      logger.debug('Deleting resource', { id });
      
      const resource = await this.getAndThrow(id);
      
      await this.resourceRepository.remove(resource);
      
      logger.info('Resource deleted successfully', { id });
    } catch (error) {
      logger.error('Error deleting resource', error, { id });
      throw error;
    }
  }

  private async getAndThrow(id: number): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({
      where: { id }
    });

    if (!resource) {
      throw new NotFoundError(`Resource with ID ${id} not found`);
    }

    return resource;
  }
}
