import mongoose from 'mongoose';
import { Data, initializeCounter } from '../../../app.js';
import { createMongoServer } from '../../helpers/mongodb.js';

describe('Counter Service Logic Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await createMongoServer();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Data.deleteMany({});
  });

  describe('Counter Initialization', () => {
    test('should initialize counter when no data exists', async () => {
      await initializeCounter();

      const data = await Data.findOne({ name: 'myData' });
      expect(data).not.toBeNull();
      expect(data.count).toBe(0);
    });

    test('should not reinitialize counter if already exists', async () => {
      await Data.create({ name: 'myData', count: 50 });

      await initializeCounter();

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(50); // Should remain unchanged
    });
  });

  describe('Counter Increment Logic', () => {
    beforeEach(async () => {
      await Data.create({ name: 'myData', count: 0 });
    });

    test('should increment counter by 1', async () => {
      const data = await Data.findOne({ name: 'myData' });
      data.count++;
      await data.save();

      const updated = await Data.findOne({ name: 'myData' });
      expect(updated.count).toBe(1);
    });

    test('should handle multiple increments', async () => {
      const data = await Data.findOne({ name: 'myData' });

      for (let i = 0; i < 10; i++) {
        data.count++;
        await data.save();
      }

      const updated = await Data.findOne({ name: 'myData' });
      expect(updated.count).toBe(10);
    });

    test('should preserve count after increment', async () => {
      let data = await Data.findOne({ name: 'myData' });
      data.count = 99;
      await data.save();

      data = await Data.findOne({ name: 'myData' });
      data.count++;
      await data.save();

      const updated = await Data.findOne({ name: 'myData' });
      expect(updated.count).toBe(100);
    });
  });

  describe('Counter Reset Logic', () => {
    test('should reset counter to zero', async () => {
      await Data.create({ name: 'myData', count: 999 });

      const data = await Data.findOne({ name: 'myData' });
      data.count = 0;
      await data.save();

      const updated = await Data.findOne({ name: 'myData' });
      expect(updated.count).toBe(0);
    });

    test('should handle reset from any value', async () => {
      const testValues = [1, 50, 100, 9999];

      for (const value of testValues) {
        await Data.deleteMany({});
        await Data.create({ name: 'myData', count: value });

        const data = await Data.findOne({ name: 'myData' });
        data.count = 0;
        await data.save();

        const updated = await Data.findOne({ name: 'myData' });
        expect(updated.count).toBe(0);
      }
    });
  });

  describe('Counter Set Logic', () => {
    beforeEach(async () => {
      await Data.create({ name: 'myData', count: 0 });
    });

    test('should set counter to specific value', async () => {
      const data = await Data.findOne({ name: 'myData' });
      data.count = 42;
      await data.save();

      const updated = await Data.findOne({ name: 'myData' });
      expect(updated.count).toBe(42);
    });

    test('should handle setting to zero', async () => {
      const data = await Data.findOne({ name: 'myData' });
      data.count = 100;
      await data.save();

      data.count = 0;
      await data.save();

      const updated = await Data.findOne({ name: 'myData' });
      expect(updated.count).toBe(0);
    });

    test('should handle negative values', async () => {
      const data = await Data.findOne({ name: 'myData' });
      data.count = -10;
      await data.save();

      const updated = await Data.findOne({ name: 'myData' });
      expect(updated.count).toBe(-10);
    });

    test('should override previous value', async () => {
      let data = await Data.findOne({ name: 'myData' });
      data.count = 100;
      await data.save();

      data = await Data.findOne({ name: 'myData' });
      data.count = 50;
      await data.save();

      const updated = await Data.findOne({ name: 'myData' });
      expect(updated.count).toBe(50);
    });
  });

  describe('Input Validation Logic', () => {
    test('parseInt should handle valid numeric strings', () => {
      expect(parseInt('42', 10)).toBe(42);
      expect(parseInt('0', 10)).toBe(0);
      expect(parseInt('999', 10)).toBe(999);
    });

    test('parseInt should return NaN for invalid input', () => {
      expect(isNaN(parseInt('abc', 10))).toBe(true);
      expect(isNaN(parseInt('', 10))).toBe(true);
      expect(isNaN(parseInt(undefined, 10))).toBe(true);
    });

    test('parseInt should handle negative numbers', () => {
      expect(parseInt('-10', 10)).toBe(-10);
      expect(parseInt('-999', 10)).toBe(-999);
    });

    test('parseInt should truncate decimals', () => {
      expect(parseInt('42.7', 10)).toBe(42);
      expect(parseInt('99.99', 10)).toBe(99);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Close connection to simulate error
      await mongoose.disconnect();

      const data = new Data({ name: 'errorTest', count: 0 });

      await expect(data.save()).rejects.toThrow();

      // Reconnect for cleanup
      await mongoose.connect(mongoServer.getUri());
    });

    test('should handle null data when counter not found', async () => {
      const data = await Data.findOne({ name: 'nonExistent' });

      expect(data).toBeNull();
    });
  });
});
