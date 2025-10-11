import { OrderingService } from '../../services/ordering.service';
import ContentBlock from '../../db/models/contentBlock.model';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ContentType } from '../../types/contentBlock.type';

describe('OrderingService', () => {
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

  describe('getNextOrder', () => {
    it('should return 1 when no items exist', async () => {
      const nextOrder = await OrderingService.getNextOrder();
      expect(nextOrder).toBe(1);
    });

    it('should return next order when items exist', async () => {
      await ContentBlock.create({
        content_type: ContentType.TEXT,
        title: 'Test 1',
        data: { content: 'test' },
        order: 5,
        is_active: true,
      });

      const nextOrder = await OrderingService.getNextOrder();
      expect(nextOrder).toBe(6);
    });
  });

  describe('assignOrder', () => {
    it('should return provided order when specified', async () => {
      const order = await OrderingService.assignOrder(3);
      expect(order).toBe(3);
    });

    it('should return next available order when not specified', async () => {
      await ContentBlock.create({
        content_type: ContentType.TEXT,
        title: 'Test 1',
        data: { content: 'test' },
        order: 2,
        is_active: true,
      });

      const order = await OrderingService.assignOrder();
      expect(order).toBe(3);
    });
  });

  describe('reorderSingle', () => {
    beforeEach(async () => {
      // Create test items with orders 1, 2, 3, 4, 5
      const items = Array.from({ length: 5 }, (_, i) => ({
        content_type: ContentType.TEXT,
        title: `Test ${i + 1}`,
        data: { content: `test ${i + 1}` },
        order: i + 1,
        is_active: true,
      }));

      await ContentBlock.insertMany(items);
    });

    it('should move item down (increase order)', async () => {
      const items = await ContentBlock.find().sort({ order: 1 });
      const itemToMove = items[0]; // order: 1

      const reorderedItem = await OrderingService.reorderSingle(
        (itemToMove._id as any).toString(),
        3
      );

      expect(reorderedItem.order).toBe(3);

      // Check that other items shifted correctly
      const updatedItems = await ContentBlock.find().sort({ order: 1 });
      const orders = updatedItems.map((item: any) => item.order);
      expect(orders).toEqual([1, 2, 3, 4, 5]);
    });

    it('should move item up (decrease order)', async () => {
      const items = await ContentBlock.find().sort({ order: 1 });
      const itemToMove = items[3]; // order: 4

      const reorderedItem = await OrderingService.reorderSingle(
        (itemToMove._id as any).toString(),
        2
      );

      expect(reorderedItem.order).toBe(2);

      // Check that other items shifted correctly
      const updatedItems = await ContentBlock.find().sort({ order: 1 });
      const orders = updatedItems.map((item: any) => item.order);
      expect(orders).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle same order (no change)', async () => {
      const items = await ContentBlock.find().sort({ order: 1 });
      const itemToMove = items[2]; // order: 3

      const reorderedItem = await OrderingService.reorderSingle(
        (itemToMove._id as any).toString(),
        3
      );

      expect(reorderedItem.order).toBe(3);

      // Check that no items changed
      const updatedItems = await ContentBlock.find().sort({ order: 1 });
      const orders = updatedItems.map((item: any) => item.order);
      expect(orders).toEqual([1, 2, 3, 4, 5]);
    });

    it('should throw error for non-existent item', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(
        OrderingService.reorderSingle(nonExistentId.toString(), 2)
      ).rejects.toThrow('not found');
    });
  });

  describe('bulkReorder', () => {
    beforeEach(async () => {
      // Create test items
      const items = Array.from({ length: 3 }, (_, i) => ({
        content_type: ContentType.TEXT,
        title: `Test ${i + 1}`,
        data: { content: `test ${i + 1}` },
        order: i + 1,
        is_active: true,
      }));

      await ContentBlock.insertMany(items);
    });

    it('should reorder multiple items', async () => {
      const items = await ContentBlock.find().sort({ order: 1 });
      
      const updates = [
        { id: (items[0]._id as any).toString(), order: 3 },
        { id: (items[1]._id as any).toString(), order: 1 },
        { id: (items[2]._id as any).toString(), order: 2 },
      ];

      const reorderedItems = await OrderingService.reorderBulk(updates);

      expect(reorderedItems).toHaveLength(3);
      
      // Verify final order
      const updatedItems = await ContentBlock.find().sort({ order: 1 });
      expect(updatedItems[0].title).toBe('Test 2'); // order: 1
      expect(updatedItems[1].title).toBe('Test 3'); // order: 2
      expect(updatedItems[2].title).toBe('Test 1'); // order: 3
    });

    it('should handle duplicate orders in request', async () => {
      const items = await ContentBlock.find().sort({ order: 1 });
      
      const updates = [
        { id: (items[0]._id as any).toString(), order: 1 },
        { id: (items[1]._id as any).toString(), order: 1 }, // Duplicate!
      ];

      await expect(
        OrderingService.reorderBulk(updates)
      ).rejects.toThrow('Duplicate orders');
    });

    it('should handle non-existent items', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const updates = [
        { id: nonExistentId.toString(), order: 1 },
      ];

      await expect(
        OrderingService.reorderBulk(updates)
      ).rejects.toThrow('not found');
    });
  });

  describe('normalizeOrders', () => {
    it('should fix gaps in order sequence', async () => {
      // Create items with gaps: orders 1, 3, 7, 10
      const items = [
        { content_type: ContentType.TEXT, title: 'Test 1', data: { content: 'test' }, order: 1, is_active: true },
        { content_type: ContentType.TEXT, title: 'Test 2', data: { content: 'test' }, order: 3, is_active: true },
        { content_type: ContentType.TEXT, title: 'Test 3', data: { content: 'test' }, order: 7, is_active: true },
        { content_type: ContentType.TEXT, title: 'Test 4', data: { content: 'test' }, order: 10, is_active: true },
      ];

      await ContentBlock.insertMany(items);

      await OrderingService.normalizeOrders();

      const updatedItems = await ContentBlock.find().sort({ order: 1 });
      const orders = updatedItems.map((item: any) => item.order);
      expect(orders).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty collection', async () => {
      await expect(OrderingService.normalizeOrders()).resolves.not.toThrow();
    });
  });

  describe('validateOrder', () => {
    it('should accept valid orders', () => {
      expect(() => OrderingService.validateOrder(0)).not.toThrow();
      expect(() => OrderingService.validateOrder(1)).not.toThrow();
      expect(() => OrderingService.validateOrder(100)).not.toThrow();
    });

    it('should reject negative orders', () => {
      expect(() => OrderingService.validateOrder(-1)).toThrow('non-negative');
    });

    it('should reject very large orders', () => {
      expect(() => OrderingService.validateOrder(10001)).toThrow('too large');
    });
  });

  describe('isOrderAvailable', () => {
    beforeEach(async () => {
      await ContentBlock.create({
        content_type: ContentType.TEXT,
        title: 'Test',
        data: { content: 'test' },
        order: 5,
        is_active: true,
      });
    });

    it('should return false for occupied order', async () => {
      const available = await OrderingService.isOrderAvailable(5);
      expect(available).toBe(false);
    });

    it('should return true for available order', async () => {
      const available = await OrderingService.isOrderAvailable(3);
      expect(available).toBe(true);
    });

    it('should exclude specified item from check', async () => {
      const item = await ContentBlock.findOne({ order: 5 });
      const available = await OrderingService.isOrderAvailable(5, (item!._id as any).toString());
      expect(available).toBe(true);
    });
  });
});
