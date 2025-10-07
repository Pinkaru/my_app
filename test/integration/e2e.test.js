import request from 'supertest';
import mongoose from 'mongoose';
import { app, Data } from '../../app.js';
import { createMongoServer } from '../helpers/mongodb.js';

describe('E2E Scenario Tests', () => {
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

  beforeEach(async () => {
    await Data.deleteMany({});
    await Data.create({ name: 'myData', count: 0 });
  });

  describe('Complete User Journey', () => {
    test('Scenario: First visit -> Multiple visits -> Reset -> Continue visiting', async () => {
      // First visit (count should be 1)
      let response = await request(app).get('/').expect(200);
      expect(response.text).toContain('1');

      // Multiple visits (count should increment)
      await request(app).get('/').expect(200);
      await request(app).get('/').expect(200);

      let data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(3);

      // Reset counter
      response = await request(app).get('/reset').expect(200);
      expect(response.text).toContain('0');

      data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(0);

      // Continue visiting after reset
      await request(app).get('/').expect(200);

      data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(1);
    });

    test('Scenario: Set counter -> Visit -> Set again -> Reset', async () => {
      // Set counter to 50
      let response = await request(app).get('/set/50').expect(200);
      expect(response.text).toContain('50');

      // Visit page (should increment to 51)
      response = await request(app).get('/').expect(200);
      expect(response.text).toContain('51');

      // Set counter using query parameter
      response = await request(app).get('/set/count?count=100').expect(200);
      expect(response.text).toContain('100');

      // Reset to zero
      response = await request(app).get('/reset').expect(200);
      expect(response.text).toContain('0');

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(0);
    });

    test('Scenario: Set to high value -> Increment -> Reset -> Increment', async () => {
      // Set to high value
      await request(app).get('/set/9999').expect(200);

      // Increment
      await request(app).get('/').expect(200);

      let data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(10000);

      // Reset
      await request(app).get('/reset').expect(200);

      // Increment from zero
      await request(app).get('/').expect(200);

      data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(1);
    });
  });

  describe('Mixed Operation Sequences', () => {
    test('should handle alternating set and increment operations', async () => {
      await request(app).get('/set/10').expect(200);
      await request(app).get('/').expect(200); // 11

      await request(app).get('/set/20').expect(200);
      await request(app).get('/').expect(200); // 21

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(21);
    });

    test('should handle multiple reset operations', async () => {
      await request(app).get('/set/100').expect(200);
      await request(app).get('/reset').expect(200);
      await request(app).get('/reset').expect(200);
      await request(app).get('/reset').expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(0);
    });

    test('should handle rapid increments followed by set', async () => {
      // Rapid increments
      for (let i = 0; i < 10; i++) {
        await request(app).get('/').expect(200);
      }

      let data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBeGreaterThan(0);

      // Override with set
      await request(app).get('/set/5').expect(200);

      data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(5);
    });
  });

  describe('Error Recovery Scenarios', () => {
    test('should recover from invalid set attempts', async () => {
      // Set to valid value
      await request(app).get('/set/50').expect(200);

      // Try invalid set
      await request(app).get('/set/invalid').expect(400);

      // Value should remain unchanged
      let data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(50);

      // Should still be able to increment
      await request(app).get('/').expect(200);

      data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(51);
    });

    test('should handle 404 errors without affecting data', async () => {
      await request(app).get('/set/100').expect(200);

      // Try non-existent route
      await request(app).get('/nonexistent').expect(404);

      // Data should remain unchanged
      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(100);
    });
  });

  describe('Concurrent User Simulation', () => {
    test('should handle multiple users visiting simultaneously', async () => {
      const concurrentVisits = 10;
      const requests = Array(concurrentVisits).fill(null).map(() =>
        request(app).get('/').expect(200)
      );

      await Promise.all(requests);

      const data = await Data.findOne({ name: 'myData' });
      // Due to race conditions, count might not be exactly 10
      // but should be greater than 0 and not exceed concurrent visits
      expect(data.count).toBeGreaterThan(0);
      expect(data.count).toBeLessThanOrEqual(concurrentVisits);
    });

    test('should handle mixed concurrent operations', async () => {
      const operations = [
        request(app).get('/'),
        request(app).get('/'),
        request(app).get('/set/50'),
        request(app).get('/'),
        request(app).get('/reset')
      ];

      await Promise.all(operations);

      const data = await Data.findOne({ name: 'myData' });
      // Result is non-deterministic due to race conditions
      // but data should exist and be a valid number
      expect(data).not.toBeNull();
      expect(typeof data.count).toBe('number');
    });
  });

  describe('Long Session Simulation', () => {
    test('should handle many sequential operations', async () => {
      const operations = [
        () => request(app).get('/'),
        () => request(app).get('/'),
        () => request(app).get('/set/10'),
        () => request(app).get('/'),
        () => request(app).get('/set/count?count=50'),
        () => request(app).get('/'),
        () => request(app).get('/'),
        () => request(app).get('/reset'),
        () => request(app).get('/'),
        () => request(app).get('/set/5')
      ];

      for (const operation of operations) {
        await operation();
      }

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(5); // Final set operation
    });

    test('should maintain data integrity through complex sequence', async () => {
      // Set initial value
      await request(app).get('/set/0').expect(200);

      // Increment 5 times
      for (let i = 0; i < 5; i++) {
        await request(app).get('/').expect(200);
      }

      let data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(5);

      // Set to new value
      await request(app).get('/set/count?count=100').expect(200);

      data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(100);

      // Increment 3 more times
      for (let i = 0; i < 3; i++) {
        await request(app).get('/').expect(200);
      }

      data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(103);

      // Reset
      await request(app).get('/reset').expect(200);

      data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(0);
    });
  });
});
