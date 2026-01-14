import { Request, Response } from 'express';
import { logger } from '../config/logging';
import {
  CreateResourceDto,
  UpdateResourceDto,
  QueryResourceDto,
  ResourceResponse,
  PaginatedResourceResponse,
} from '../dto';
import { ResourceService } from '../services/resource.service';
import { ApiResponse } from '../types';

export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  /**
   * Create a new resource
   * POST /api/v1/resources
   */
  async createResource(req: Request, res: Response): Promise<void> {
    const resourceData = req.body as CreateResourceDto;

    logger.info('Creating new resource', {
      name: resourceData.name,
      category: resourceData.category,
    });

    const resourceResponse = await this.resourceService.createResource(
      resourceData
    );

    const response: ApiResponse<ResourceResponse> = {
      success: true,
      data: resourceResponse,
      message: 'Resource created successfully',
    };

    res.status(201).json(response);
  }

  /**
   * Get resources with filters and pagination
   * GET /api/v1/resources
   */
  async getResources(req: Request, res: Response): Promise<void> {
    const queryParams = (req as any).validatedQuery as QueryResourceDto;

    logger.debug('Fetching resources with filters', { filters: queryParams });

    const paginatedResponse = await this.resourceService.getResources(
      queryParams
    );

    const response: ApiResponse<PaginatedResourceResponse> = {
      success: true,
      data: paginatedResponse,
    };

    res.json(response);
  }

  /**
   * Get a single resource by ID
   * GET /api/v1/resources/:id
   */
  async getResourceById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);

    logger.debug('Fetching resource by ID', { id });

    const resourceResponse = await this.resourceService.getResourceById(id);

    const response: ApiResponse<ResourceResponse> = {
      success: true,
      data: resourceResponse,
    };

    res.json(response);
  }

  /**
   * Update a resource
   * PUT /api/v1/resources/:id
   */
  async updateResource(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);
    const updateData = req.body as UpdateResourceDto;

    logger.info('Updating resource', { id, updateData });

    const resourceResponse = await this.resourceService.updateResource(
      id,
      updateData
    );

    const response: ApiResponse<ResourceResponse> = {
      success: true,
      data: resourceResponse,
      message: 'Resource updated successfully',
    };

    res.json(response);
  }

  /**
   * Delete a resource
   * DELETE /api/v1/resources/:id
   */
  async deleteResource(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);

    logger.info('Deleting resource', { id });

    await this.resourceService.deleteResource(id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Resource deleted successfully',
    };

    res.json(response);
  }
}
