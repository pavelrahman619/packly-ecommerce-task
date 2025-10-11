import ContentBlock from '../db/models/contentBlock.model';
import { IContentBlock } from '../types/contentBlock.type';
import { NotFoundError, ConflictError } from '../lib/errors';
import mongoose from 'mongoose';

export class OrderingService {
  /**
   * Get the next available order number
   */
  static async getNextOrder(): Promise<number> {
    const lastItem = await ContentBlock.findOne().sort({ order: -1 }).exec();
    return lastItem ? lastItem.order + 1 : 1;
  }

  /**
   * Assign order to a new content block
   * If no order is provided, assign the next available order
   */
  static async assignOrder(order?: number): Promise<number> {
    if (order !== undefined) {
      return order;
    }
    return await this.getNextOrder();
  }

  /**
   * Reorder a single content block
   * Handles shifting other items to maintain sequence
   */
  static async reorderSingle(itemId: string, newOrder: number): Promise<IContentBlock> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const item = await ContentBlock.findById(itemId).session(session);
      if (!item) {
        throw new NotFoundError(`Content block with ID ${itemId} not found`);
      }

      const oldOrder = item.order;

      // If order hasn't changed, return the item as-is
      if (oldOrder === newOrder) {
        await session.commitTransaction();
        return item;
      }

      // Check if target position is already occupied
      const existingAtPosition = await ContentBlock.findOne({
        order: newOrder,
        _id: { $ne: itemId },
      }).session(session);

      if (newOrder > oldOrder) {
        // Moving down: shift items between old+1 and new position up by 1
        await ContentBlock.updateMany(
          {
            order: { $gt: oldOrder, $lte: newOrder },
            _id: { $ne: itemId },
          },
          { $inc: { order: -1 } }
        ).session(session);
      } else {
        // Moving up: shift items between new and old-1 position down by 1
        await ContentBlock.updateMany(
          {
            order: { $gte: newOrder, $lt: oldOrder },
            _id: { $ne: itemId },
          },
          { $inc: { order: 1 } }
        ).session(session);
      }

      // Update the item's order
      item.order = newOrder;
      await item.save({ session });

      await session.commitTransaction();
      return item;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Bulk reorder multiple content blocks atomically
   */
  static async reorderBulk(
    updates: Array<{ id: string; order: number }>
  ): Promise<IContentBlock[]> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate all items exist
      const itemIds = updates.map(u => u.id);
      const existingItems = await ContentBlock.find({
        _id: { $in: itemIds }
      }).session(session);

      if (existingItems.length !== itemIds.length) {
        const foundIds = existingItems.map((item: any) => item._id.toString());
        const missingIds = itemIds.filter(id => !foundIds.includes(id));
        throw new NotFoundError(`Content blocks not found: ${missingIds.join(', ')}`);
      }

      // Check for duplicate orders in the update request
      const orders = updates.map(u => u.order);
      const uniqueOrders = new Set(orders);
      if (orders.length !== uniqueOrders.size) {
        throw new ConflictError('Duplicate orders found in bulk update request');
      }

      // Sort updates by new order to process in sequence
      const sortedUpdates = updates.sort((a, b) => a.order - b.order);
      const updatedItems: IContentBlock[] = [];

      // First, set all items to temporary negative orders to avoid conflicts
      for (let i = 0; i < sortedUpdates.length; i++) {
        const update = sortedUpdates[i];
        await ContentBlock.findByIdAndUpdate(
          update.id,
          { order: -(i + 1000) }, // Use negative numbers to avoid conflicts
          { session }
        );
      }

      // Then, set the final orders
      for (const update of sortedUpdates) {
        const item = await ContentBlock.findByIdAndUpdate(
          update.id,
          { order: update.order },
          { new: true, session }
        );
        if (item) {
          updatedItems.push(item);
        }
      }

      await session.commitTransaction();
      return updatedItems;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Normalize order sequence to fix gaps
   * Reassigns orders as 1, 2, 3, ... based on current order
   */
  static async normalizeOrders(): Promise<void> {
    const items = await ContentBlock.find().sort({ order: 1 }).exec();
    
    const updates = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { order: index + 1 },
      },
    }));

    if (updates.length > 0) {
      await ContentBlock.bulkWrite(updates);
    }
  }

  /**
   * Handle order conflicts when creating/updating items
   * Shifts existing items to make room for the new order
   */
  static async handleOrderConflict(
    order: number,
    excludeId?: string
  ): Promise<void> {
    const filter: any = { order: { $gte: order } };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    await ContentBlock.updateMany(filter, { $inc: { order: 1 } });
  }

  /**
   * Validate order value and ensure it's within reasonable bounds
   */
  static validateOrder(order: number): void {
    if (order < 0) {
      throw new ConflictError('Order must be a non-negative number');
    }
    
    if (order > 10000) {
      throw new ConflictError('Order value too large (max: 10000)');
    }
  }

  /**
   * Get items in order range for reordering validation
   */
  static async getItemsInRange(
    minOrder: number,
    maxOrder: number
  ): Promise<IContentBlock[]> {
    return await ContentBlock.find({
      order: { $gte: minOrder, $lte: maxOrder }
    }).sort({ order: 1 }).exec();
  }

  /**
   * Check if order position is available
   */
  static async isOrderAvailable(order: number, excludeId?: string): Promise<boolean> {
    const filter: any = { order };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const existingItem = await ContentBlock.findOne(filter);
    return !existingItem;
  }
}
