import mongoose from 'mongoose';
import { Data } from '../../../app.js';
import { createMongoServer } from '../../helpers/mongodb.js';

describe('Data Model Unit Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await createMongoServer();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up after each test
    await Data.deleteMany({});
  });

  describe('Schema Validation', () => {
    test('should create a document with valid name and count', async () => {
      const validData = {
        name: 'testData',
        count: 5
      };

      const data = await Data.create(validData);

      expect(data.name).toBe('testData');
      expect(data.count).toBe(5);
      expect(data._id).toBeDefined();
    });

    test('should use default count of 0 when not provided', async () => {
      const data = await Data.create({ name: 'defaultTest' });

      expect(data.count).toBe(0);
    });

    test('should require name field', async () => {
      const invalidData = new Data({ count: 10 });

      await expect(invalidData.save()).rejects.toThrow();
    });

    test('should enforce unique constraint on name', async () => {
      await Data.create({ name: 'uniqueTest', count: 1 });

      await expect(
        Data.create({ name: 'uniqueTest', count: 2 })
      ).rejects.toThrow();
    });
  });

  describe('CRUD Operations', () => {
    test('should find a document by name', async () => {
      await Data.create({ name: 'findTest', count: 10 });

      const found = await Data.findOne({ name: 'findTest' });

      expect(found).not.toBeNull();
      expect(found.name).toBe('findTest');
      expect(found.count).toBe(10);
    });

    test('should update document count', async () => {
      const data = await Data.create({ name: 'updateTest', count: 5 });

      data.count = 10;
      await data.save();

      const updated = await Data.findOne({ name: 'updateTest' });
      expect(updated.count).toBe(10);
    });

    test('should delete a document', async () => {
      const data = await Data.create({ name: 'deleteTest', count: 5 });

      await Data.deleteOne({ _id: data._id });

      const found = await Data.findOne({ name: 'deleteTest' });
      expect(found).toBeNull();
    });

    test('should increment count correctly', async () => {
      const data = await Data.create({ name: 'incrementTest', count: 0 });

      data.count++;
      await data.save();

      const updated = await Data.findOne({ name: 'incrementTest' });
      expect(updated.count).toBe(1);
    });

    test('should reset count to zero', async () => {
      const data = await Data.create({ name: 'resetTest', count: 100 });

      data.count = 0;
      await data.save();

      const updated = await Data.findOne({ name: 'resetTest' });
      expect(updated.count).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle large count values', async () => {
      const largeCount = 999999999;
      const data = await Data.create({ name: 'largeTest', count: largeCount });

      expect(data.count).toBe(largeCount);
    });

    test('should handle negative count values', async () => {
      const data = await Data.create({ name: 'negativeTest', count: -5 });

      expect(data.count).toBe(-5);
    });

    test('should return null when document not found', async () => {
      const found = await Data.findOne({ name: 'nonExistent' });

      expect(found).toBeNull();
    });
  });
});
