import { Application } from 'express';
import request from 'supertest';
import { App } from '../../src/app';
import { Resource } from '../../src/entities/Resource';
import { testDataSource } from '../setup';

describe('Resource API Integration Tests', () => {
  let server: Application;
  let testApp: App;

  beforeAll(async () => {
    // Create app instance with test database
    testApp = new App(testDataSource);
    await testApp.initialize();
    server = testApp.getApp();
  }, 30000);

  beforeEach(async () => {
    // Clear all data before each test
    const resourceRepository = testDataSource.getRepository(Resource);
    await resourceRepository.clear();
  });

  describe('POST /api/v1/resources', () => {
    it('should create a new resource', async () => {
      const resourceData = {
        name: 'Test Resource',
        description: 'This is a test resource',
        category: 'test-category',
      };

      const response = await request(server)
        .post('/api/v1/resources')
        .send(resourceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: resourceData.name,
        description: resourceData.description,
        category: resourceData.category,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        description: 'Test description',
        // missing category
      };

      const response = await request(server)
        .post('/api/v1/resources')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/resources', () => {
    beforeEach(async () => {
      // Create test data
      const resourceRepository = testDataSource.getRepository(Resource);

      const resources = [
        new Resource({
          name: 'Resource 1',
          description: 'Description 1',
          category: 'category1',
        }),
        new Resource({
          name: 'Resource 2',
          description: 'Description 2',
          category: 'category2',
        }),
        new Resource({
          name: 'Resource 3',
          description: 'Description 3',
          category: 'category1',
        }),
      ];

      await resourceRepository.save(resources);
    });

    it('should return all resources with pagination', async () => {
      const response = await request(server)
        .get('/api/v1/resources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.pagination).toMatchObject({
        total: 3,
        limit: 10,
        offset: 0,
        hasMore: false,
      });
    });

    it('should filter resources by category', async () => {
      const response = await request(server)
        .get('/api/v1/resources?category=category1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(
        response.body.data.data.every((r: any) => r.category === 'category1')
      ).toBe(true);
    });

    it('should filter resources by name', async () => {
      const response = await request(server)
        .get('/api/v1/resources?name=Resource 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].name).toBe('Resource 1');
    });

    it('should apply pagination correctly', async () => {
      const response = await request(server)
        .get('/api/v1/resources?limit=2&offset=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        total: 3,
        limit: 2,
        offset: 1,
        hasMore: false,
      });
    });
  });

  describe('GET /api/v1/resources/:id', () => {
    let resourceId: number;

    beforeEach(async () => {
      const resourceRepository = testDataSource.getRepository(Resource);
      const resource = new Resource({
        name: 'Test Resource',
        description: 'Test Description',
        category: 'test-category',
      });
      const savedResource = await resourceRepository.save(resource);
      resourceId = savedResource.id;
    });

    it('should return resource by ID', async () => {
      const response = await request(server)
        .get(`/api/v1/resources/${resourceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(resourceId);
      expect(response.body.data.name).toBe('Test Resource');
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(server)
        .get('/api/v1/resources/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(server)
        .get('/api/v1/resources/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid resource ID');
    });
  });

  describe('PUT /api/v1/resources/:id', () => {
    let resourceId: number;

    beforeEach(async () => {
      const resourceRepository = testDataSource.getRepository(Resource);
      const resource = new Resource({
        name: 'Original Name',
        description: 'Original Description',
        category: 'original-category',
      });
      const savedResource = await resourceRepository.save(resource);
      resourceId = savedResource.id;
    });

    it('should update resource successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const response = await request(server)
        .put(`/api/v1/resources/${resourceId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.category).toBe('original-category'); // unchanged
    });

    it('should return 404 for non-existent resource', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(server)
        .put('/api/v1/resources/99999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for empty update data', async () => {
      const response = await request(server)
        .put(`/api/v1/resources/${resourceId}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain(
        'At least one field must be provided'
      );
    });
  });

  describe('DELETE /api/v1/resources/:id', () => {
    let resourceId: number;

    beforeEach(async () => {
      const resourceRepository = testDataSource.getRepository(Resource);
      const resource = new Resource({
        name: 'Test Resource',
        description: 'Test Description',
        category: 'test-category',
      });
      const savedResource = await resourceRepository.save(resource);
      resourceId = savedResource.id;
    });

    it('should delete resource successfully', async () => {
      const response = await request(server)
        .delete(`/api/v1/resources/${resourceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Resource deleted successfully');

      // Verify resource is deleted
      await request(server).get(`/api/v1/resources/${resourceId}`).expect(404);
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(server)
        .delete('/api/v1/resources/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(server).get('/health').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('OK');
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.environment).toBeDefined();
    });
  });
});
