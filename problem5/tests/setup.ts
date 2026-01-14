import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { createDataSource } from '../src/config/database';

let testDataSource: DataSource;

beforeAll(async () => {
  // Create in-memory database for testing
  testDataSource = createDataSource(':memory:');

  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }
}, 30000);

afterAll(async () => {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
}, 10000);

beforeEach(async () => {
  // Clean up database before each test
  if (testDataSource && testDataSource.isInitialized) {
    const entities = testDataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = testDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
});

export { testDataSource };
