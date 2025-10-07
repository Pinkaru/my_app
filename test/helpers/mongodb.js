import { MongoMemoryServer } from 'mongodb-memory-server';

// Create MongoDB Memory Server with proper configuration
export async function createMongoServer() {
  try {
    const mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.14', // Use MongoDB 7 for Debian 12+ compatibility
      },
    });
    return mongoServer;
  } catch (error) {
    console.error('Failed to create MongoDB Memory Server:', error.message);
    throw error;
  }
}
