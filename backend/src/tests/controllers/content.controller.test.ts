import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ContentBlock from '../../db/models/contentBlock.model';
import contentRoutes from '../../routes/content.router';
import { errorHandler } from '../../middleware/erroHandler';
import { ContentType } from '../../types/contentBlock.type';

const app = express();
app.use(express.json());
app.use('/api/content', contentRoutes);
app.use(errorHandler);

describe('Content Controller', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await ContentBlock.deleteMany({});
  });

  describe('GET /api/content', () => {
    it('should return empty array when no content blocks exist', async () => {
      const response = await request(app)
        .get('/api/content')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return content blocks with pagination', async () => {
      // Create test data
      const testBlocks = [
        {
          content_type: ContentType.TEXT,
          title: 'Test Block 1',
          data: { content: 'Test content 1' },
          order: 1,
          is_active: true,
        },
        {
          content_type: ContentType.BANNER,
          title: 'Test Block 2',
          data: { image_url: 'https://example.com/image.jpg', alt_text: 'Test image' },
          order: 2,
          is_active: true,
        },
      ];

      await ContentBlock.insertMany(testBlocks);

      const response = await request(app)
        .get('/api/content')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.data[0].title).toBe('Test Block 1');
      expect(response.body.data[1].title).toBe('Test Block 2');
    });

    it('should filter by content type', async () => {
      const testBlocks = [
        {
          content_type: ContentType.TEXT,
          title: 'Text Block',
          data: { content: 'Test content' },
          order: 1,
          is_active: true,
        },
        {
          content_type: ContentType.BANNER,
          title: 'Banner Block',
          data: { image_url: 'https://example.com/image.jpg' },
          order: 2,
          is_active: true,
        },
      ];

      await ContentBlock.insertMany(testBlocks);

      const response = await request(app)
        .get('/api/content?content_type=text')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].content_type).toBe('text');
    });

    it('should handle pagination parameters', async () => {
      const testBlocks = Array.from({ length: 15 }, (_, i) => ({
        content_type: ContentType.TEXT,
        title: `Test Block ${i + 1}`,
        data: { content: `Test content ${i + 1}` },
        order: i + 1,
        is_active: true,
      }));

      await ContentBlock.insertMany(testBlocks);

      const response = await request(app)
        .get('/api/content?page=2&limit=5')
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.total).toBe(15);
      expect(response.body.pagination.pages).toBe(3);
    });

    it('should search in title and content', async () => {
      const testBlocks = [
        {
          content_type: ContentType.TEXT,
          title: 'About Us',
          data: { content: 'Learn about our company' },
          order: 1,
          is_active: true,
        },
        {
          content_type: ContentType.TEXT,
          title: 'Contact',
          data: { content: 'Get in touch' },
          order: 2,
          is_active: true,
        },
      ];

      await ContentBlock.insertMany(testBlocks);

      const response = await request(app)
        .get('/api/content?search=about')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('About Us');
    });
  });

  describe('GET /api/content/:id', () => {
    it('should return content block by ID', async () => {
      const testBlock = new ContentBlock({
        content_type: ContentType.TEXT,
        title: 'Test Block',
        data: { content: 'Test content' },
        order: 1,
        is_active: true,
      });

      const savedBlock = await testBlock.save();

      const response = await request(app)
        .get(`/api/content/${(savedBlock._id as any).toString()}`)
        .expect(200);

      expect(response.body.title).toBe('Test Block');
      expect(response.body._id).toBe((savedBlock._id as any).toString());
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/content/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/content/invalid-id')
        .expect(400);

      expect(response.body.message).toContain('Invalid');
    });
  });

  // Note: POST, PUT, DELETE, PATCH tests would require authentication middleware
  // These tests would need to mock the auth middleware or use test tokens
  
  describe('Validation', () => {
    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/content?page=0&limit=101')
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });

    it('should validate invalid content type filter', async () => {
      const response = await request(app)
        .get('/api/content?content_type=invalid')
        .expect(400);

      expect(response.body.message).toContain('Validation failed');
    });
  });
});
