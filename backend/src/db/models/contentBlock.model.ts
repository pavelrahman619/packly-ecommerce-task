import mongoose, { Schema, Document, Model } from "mongoose";
import { IContentBlock, ContentType } from "../../types/contentBlock.type";

const ContentBlockSchema = new Schema<IContentBlock>(
  {
    content_type: {
      type: String,
      required: true,
      enum: Object.values(ContentType),
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (value: any) {
          return value && typeof value === 'object';
        },
        message: 'Data must be a valid object',
      },
    },
    order: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    metadata: {
      created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
      updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
      },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for efficient querying
ContentBlockSchema.index({ is_active: 1, order: 1 });
ContentBlockSchema.index({ content_type: 1, is_active: 1, order: 1 });

// Pre-save hook to handle order conflicts
ContentBlockSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('order')) {
    const ContentBlock = this.constructor as Model<IContentBlock>;
    
    // Check for existing item with same order
    const existingItem = await ContentBlock.findOne({
      order: this.order,
      _id: { $ne: this._id },
    });

    if (existingItem) {
      // Shift all items with order >= this.order up by 1
      await ContentBlock.updateMany(
        {
          order: { $gte: this.order },
          _id: { $ne: this._id },
        },
        { $inc: { order: 1 } }
      );
    }
  }
  next();
});

// Static method to get next available order
ContentBlockSchema.statics.getNextOrder = async function (): Promise<number> {
  const lastItem = await this.findOne().sort({ order: -1 }).exec();
  return lastItem ? lastItem.order + 1 : 1;
};

// Static method to reorder items
ContentBlockSchema.statics.reorderItems = async function (
  itemId: string,
  newOrder: number
): Promise<IContentBlock | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const item = await this.findById(itemId).session(session);
    if (!item) {
      throw new Error('Item not found');
    }

    const oldOrder = item.order;

    if (oldOrder === newOrder) {
      await session.commitTransaction();
      return item;
    }

    if (newOrder > oldOrder) {
      // Moving down: shift items between old and new position up
      await this.updateMany(
        {
          order: { $gt: oldOrder, $lte: newOrder },
          _id: { $ne: itemId },
        },
        { $inc: { order: -1 } }
      ).session(session);
    } else {
      // Moving up: shift items between new and old position down
      await this.updateMany(
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
};

// Static method for bulk reordering
ContentBlockSchema.statics.bulkReorder = async function (
  updates: Array<{ id: string; order: number }>
): Promise<IContentBlock[]> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedItems: IContentBlock[] = [];

    // Sort updates by new order to process in sequence
    const sortedUpdates = updates.sort((a, b) => a.order - b.order);

    for (const update of sortedUpdates) {
      const item = await this.findById(update.id).session(session);
      if (!item) {
        throw new Error(`Item with id ${update.id} not found`);
      }

      item.order = update.order;
      await item.save({ session });
      updatedItems.push(item);
    }

    await session.commitTransaction();
    return updatedItems;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Static method to normalize order sequence (fix gaps)
ContentBlockSchema.statics.normalizeOrders = async function (): Promise<void> {
  const items = await this.find().sort({ order: 1 }).exec();
  
  const updates = items.map((item: any, index: number) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { order: index + 1 },
    },
  }));

  if (updates.length > 0) {
    await this.bulkWrite(updates);
  }
};

const ContentBlock = mongoose.model<IContentBlock>('ContentBlock', ContentBlockSchema);

export default ContentBlock;
