import request from 'supertest';
import mongoose from 'mongoose';
import { app, Data } from '../../../app.js';
import { createMongoServer } from '../../helpers/mongodb.js';

describe('Integration Tests - Routes', () => {
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

  describe('GET /', () => {
    test('should increment counter and render page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(1);
      expect(response.text).toContain('1');
    });

    test('should increment counter on multiple visits', async () => {
      await request(app).get('/').expect(200);
      await request(app).get('/').expect(200);
      await request(app).get('/').expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(3);
    });

    test('should return 404 when data not found', async () => {
      await Data.deleteMany({});

      await request(app)
        .get('/')
        .expect(404);
    });

    test('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/').expect(200)
      );

      await Promise.all(requests);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBeGreaterThan(0);
      expect(data.count).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /reset', () => {
    test('should reset counter to zero', async () => {
      await Data.updateOne({ name: 'myData' }, { count: 100 });

      const response = await request(app)
        .get('/reset')
        .expect(200)
        .expect('Content-Type', /html/);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(0);
      expect(response.text).toContain('0');
    });

    test('should reset already zero counter', async () => {
      await request(app)
        .get('/reset')
        .expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(0);
    });

    test('should return 404 when data not found', async () => {
      await Data.deleteMany({});

      await request(app)
        .get('/reset')
        .expect(404);
    });

    test('should allow incrementing after reset', async () => {
      await request(app).get('/reset').expect(200);
      await request(app).get('/').expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(1);
    });
  });

  describe('GET /set/count (query parameter)', () => {
    test('should set counter using query parameter', async () => {
      const response = await request(app)
        .get('/set/count?count=42')
        .expect(200)
        .expect('Content-Type', /html/);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(42);
      expect(response.text).toContain('42');
    });

    test('should set counter to zero', async () => {
      await request(app)
        .get('/set/count?count=0')
        .expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(0);
    });

    test('should handle large numbers', async () => {
      await request(app)
        .get('/set/count?count=999999')
        .expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(999999);
    });

    test('should return 400 for invalid count', async () => {
      await request(app)
        .get('/set/count?count=abc')
        .expect(400);
    });

    test('should return 400 for missing count parameter', async () => {
      await request(app)
        .get('/set/count')
        .expect(400);
    });

    test('should return 404 when data not found', async () => {
      await Data.deleteMany({});

      await request(app)
        .get('/set/count?count=10')
        .expect(404);
    });
  });

  describe('GET /set/:num (path parameter)', () => {
    test('should set counter using path parameter', async () => {
      const response = await request(app)
        .get('/set/50')
        .expect(200)
        .expect('Content-Type', /html/);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(50);
      expect(response.text).toContain('50');
    });

    test('should set counter to zero', async () => {
      await request(app)
        .get('/set/0')
        .expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(0);
    });

    test('should handle negative numbers', async () => {
      await request(app)
        .get('/set/-10')
        .expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(-10);
    });

    test('should return 400 for invalid number', async () => {
      await request(app)
        .get('/set/invalid')
        .expect(400);
    });

    test('should return 404 when data not found', async () => {
      await Data.deleteMany({});

      await request(app)
        .get('/set/100')
        .expect(404);
    });

    test('should override previous value', async () => {
      await request(app).get('/set/100').expect(200);
      await request(app).get('/set/50').expect(200);

      const data = await Data.findOne({ name: 'myData' });
      expect(data.count).toBe(50);
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown routes', async () => {
      await request(app)
        .get('/unknown-route')
        .expect(404);
    });

    test('should handle POST requests to root', async () => {
      await request(app)
        .post('/')
        .expect(404);
    });

    test('should handle PUT requests', async () => {
      await request(app)
        .put('/some-path')
        .expect(404);
    });
  });
});
