import { Router } from 'express';
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto } from '../dto';
import {
  asyncHandler,
  validateDto,
  validateIdParam,
  validateUpdateNotEmpty,
} from '../middleware';
import { ResourceService } from '../services/resource.service';
import { ResourceController } from '../controllers/resource.controller';

const createResourceRoutes = (resourceService: ResourceService): Router => {
  const router = Router();
  const controller = new ResourceController(resourceService);

  // CREATE - POST /api/v1/resources
  router.post(
    '/resources',
    validateDto(CreateResourceDto, 'body'),
    asyncHandler((req, res) => controller.createResource(req, res))
  );

  // READ - GET /api/v1/resources (with filters and pagination)
  router.get(
    '/resources',
    validateDto(QueryResourceDto, 'query'),
    asyncHandler((req, res) => controller.getResources(req, res))
  );

  // READ - GET /api/v1/resources/:id
  router.get(
    '/resources/:id',
    validateIdParam(),
    asyncHandler((req, res) => controller.getResourceById(req, res))
  );

  // UPDATE - PUT /api/v1/resources/:id
  router.put(
    '/resources/:id',
    validateIdParam(),
    validateUpdateNotEmpty(),
    validateDto(UpdateResourceDto, 'body'),
    asyncHandler((req, res) => controller.updateResource(req, res))
  );

  // DELETE - DELETE /api/v1/resources/:id
  router.delete(
    '/resources/:id',
    validateIdParam(),
    asyncHandler((req, res) => controller.deleteResource(req, res))
  );

  return router;
};

export default createResourceRoutes;
