import { Request, Response, NextFunction } from 'express';
import ContentBlock from '../db/models/contentBlock.model';
import { OrderingService } from '../services/ordering.service';
import { PaginationHelper } from '../lib/pagination';
import { 
  IGetAllContentBlocksQuery, 
  ICreateContentBlockRequest,
  IUpdateContentBlockRequest,
  IReorderRequest,
  IBulkReorderRequest,
  IContentBlockResponse,
  ContentType,
  validateContentTypeData
} from '../types/contentBlock.type';
import { 
  NotFoundError, 
  ValidationError, 
  BadRequestError 
} from '../lib/errors';

/**
 * @swagger
 * tags:
 *   name: Content Blocks
 *   description: Content block management endpoints
 */

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Get all content blocks
 *     tags: [Content Blocks]
 *     parameters:
 *       - in: query
 *         name: content_type
 *         schema:
 *           type: string
 *           enum: [text, banner, card, hero, cta]
 *         description: Filter by content type (can be comma-separated for multiple types)
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status (defaults to true for public access)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content data
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [order, created_at, updated_at, title]
 *           default: order
 *         description: Sort field
 *       - in: query
 *         name: sort_direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Content blocks retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
export const getAllContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query as IGetAllContentBlocksQuery;
    
    // Parse pagination parameters
    const { skip, limit, page } = PaginationHelper.parsePaginationParams(query);
    
    // Build filter
    const filter = PaginationHelper.buildFilter(query);
    
    // Parse sort parameters
    const sort = PaginationHelper.parseSortParams(query);
    
    // Execute query with pagination
    const [items, total] = await Promise.all([
      ContentBlock.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ContentBlock.countDocuments(filter).exec(),
    ]);

    // Transform response
    const transformedItems: IContentBlockResponse[] = items.map((item: any) => ({
      _id: item._id.toString(),
      content_type: item.content_type,
      title: item.title,
      data: item.data as Record<string, any>,
      order: item.order,
      is_active: item.is_active,
      metadata: {
        created_by: item.metadata.created_by?.toString(),
        updated_by: item.metadata.updated_by?.toString(),
      },
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
    }));

    const response = PaginationHelper.createPaginatedResponse(
      transformedItems,
      page,
      limit,
      total
    );

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get content block by ID
 *     tags: [Content Blocks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content block ID
 *     responses:
 *       200:
 *         description: Content block retrieved successfully
 *       404:
 *         description: Content block not found
 */
export const getContentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const item = await ContentBlock.findById(id).lean().exec();
    
    if (!item) {
      throw new NotFoundError(`Content block with ID ${id} not found`);
    }

    const response: IContentBlockResponse = {
      _id: (item._id as any).toString(),
      content_type: item.content_type,
      title: item.title,
      data: item.data as Record<string, any>,
      order: item.order,
      is_active: item.is_active,
      metadata: {
        created_by: item.metadata.created_by?.toString(),
        updated_by: item.metadata.updated_by?.toString(),
      },
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create new content block
 *     tags: [Content Blocks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content_type
 *               - title
 *               - data
 *             properties:
 *               content_type:
 *                 type: string
 *                 enum: [text, banner, card, hero, cta]
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               data:
 *                 type: object
 *               order:
 *                 type: integer
 *                 minimum: 0
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Content block created successfully
 *       400:
 *         description: Invalid request data
 *       422:
 *         description: Validation errors
 */
export const createContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      content_type,
      title,
      data,
      order,
      is_active = true,
    } = req.body as ICreateContentBlockRequest;

    // Validate content type specific data
    const dataValidationErrors = validateContentTypeData(content_type, data);
    if (dataValidationErrors.length > 0) {
      const formattedErrors: Record<string, string[]> = {};
      dataValidationErrors.forEach(error => {
        if (!formattedErrors[error.field]) {
          formattedErrors[error.field] = [];
        }
        formattedErrors[error.field].push(error.message);
      });
      throw new ValidationError('Content data validation failed', formattedErrors);
    }

    // Assign order if not provided
    const assignedOrder = await OrderingService.assignOrder(order);

    // Validate order
    OrderingService.validateOrder(assignedOrder);

    // Create content block
    const contentBlock = new ContentBlock({
      content_type,
      title,
      data,
      order: assignedOrder,
      is_active,
      metadata: {
        created_by: (req as any).user?.userId, // From auth middleware
        updated_by: (req as any).user?.userId,
      },
    });

    const savedItem = await contentBlock.save();

    const response: IContentBlockResponse = {
      _id: (savedItem._id as any).toString(),
      content_type: savedItem.content_type,
      title: savedItem.title,
      data: savedItem.data as Record<string, any>,
      order: savedItem.order,
      is_active: savedItem.is_active,
      metadata: {
        created_by: savedItem.metadata.created_by?.toString(),
        updated_by: savedItem.metadata.updated_by?.toString(),
      },
      created_at: savedItem.created_at.toISOString(),
      updated_at: savedItem.updated_at.toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/content/{id}:
 *   put:
 *     summary: Update content block
 *     tags: [Content Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content block ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               data:
 *                 type: object
 *               order:
 *                 type: integer
 *                 minimum: 0
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Content block updated successfully
 *       404:
 *         description: Content block not found
 *       422:
 *         description: Validation errors
 */
export const updateContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body as IUpdateContentBlockRequest;

    const existingItem = await ContentBlock.findById(id);
    if (!existingItem) {
      throw new NotFoundError(`Content block with ID ${id} not found`);
    }

    // Validate content type specific data if data is being updated
    if (updates.data) {
      const dataValidationErrors = validateContentTypeData(
        existingItem.content_type,
        updates.data
      );
      if (dataValidationErrors.length > 0) {
        const formattedErrors: Record<string, string[]> = {};
        dataValidationErrors.forEach(error => {
          if (!formattedErrors[error.field]) {
            formattedErrors[error.field] = [];
          }
          formattedErrors[error.field].push(error.message);
        });
        throw new ValidationError('Content data validation failed', formattedErrors);
      }
    }

    // Validate order if being updated
    if (updates.order !== undefined) {
      OrderingService.validateOrder(updates.order);
    }

    // Update metadata
    const updateData = {
      ...updates,
      'metadata.updated_by': (req as any).user?.userId,
    };

    const updatedItem = await ContentBlock.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      throw new NotFoundError(`Content block with ID ${id} not found`);
    }

    const response: IContentBlockResponse = {
      _id: (updatedItem._id as any).toString(),
      content_type: updatedItem.content_type,
      title: updatedItem.title,
      data: updatedItem.data as Record<string, any>,
      order: updatedItem.order,
      is_active: updatedItem.is_active,
      metadata: {
        created_by: updatedItem.metadata.created_by?.toString(),
        updated_by: updatedItem.metadata.updated_by?.toString(),
      },
      created_at: updatedItem.created_at.toISOString(),
      updated_at: updatedItem.updated_at.toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete content block
 *     tags: [Content Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content block ID
 *     responses:
 *       200:
 *         description: Content block deleted successfully
 *       404:
 *         description: Content block not found
 */
export const deleteContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedItem = await ContentBlock.findByIdAndDelete(id);
    
    if (!deletedItem) {
      throw new NotFoundError(`Content block with ID ${id} not found`);
    }

    res.status(200).json({
      message: 'Content block deleted successfully',
      deleted_id: id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/content/{id}/order:
 *   patch:
 *     summary: Reorder single content block
 *     tags: [Content Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content block ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order
 *             properties:
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Content block reordered successfully
 *       404:
 *         description: Content block not found
 */
export const reorderContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { order } = req.body as IReorderRequest;

    // Validate order
    OrderingService.validateOrder(order);

    const reorderedItem = await OrderingService.reorderSingle(id, order);

    // Update metadata
    reorderedItem.metadata.updated_by = (req as any).user?.userId;
    await reorderedItem.save();

    const response: IContentBlockResponse = {
      _id: (reorderedItem._id as any).toString(),
      content_type: reorderedItem.content_type,
      title: reorderedItem.title,
      data: reorderedItem.data as Record<string, any>,
      order: reorderedItem.order,
      is_active: reorderedItem.is_active,
      metadata: {
        created_by: reorderedItem.metadata.created_by?.toString(),
        updated_by: reorderedItem.metadata.updated_by?.toString(),
      },
      created_at: reorderedItem.created_at.toISOString(),
      updated_at: reorderedItem.updated_at.toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/content/bulk-reorder:
 *   post:
 *     summary: Bulk reorder content blocks
 *     tags: [Content Blocks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: integer
 *                       minimum: 0
 *     responses:
 *       200:
 *         description: Content blocks reordered successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: One or more content blocks not found
 */
export const bulkReorderContent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body as IBulkReorderRequest;

    // Validate all orders
    items.forEach(item => {
      OrderingService.validateOrder(item.order);
    });

    const reorderedItems = await OrderingService.reorderBulk(items);

    // Update metadata for all items
    const userId = (req as any).user?.userId;
    if (userId) {
      await ContentBlock.updateMany(
        { _id: { $in: items.map(item => item.id) } },
        { 'metadata.updated_by': userId }
      );
    }

    // Fetch updated items with metadata
    const updatedItems = await ContentBlock.find({
      _id: { $in: items.map(item => item.id) }
    }).sort({ order: 1 });

    const response: IContentBlockResponse[] = updatedItems.map(item => ({
      _id: (item._id as any).toString(),
      content_type: item.content_type,
      title: item.title,
      data: item.data as Record<string, any>,
      order: item.order,
      is_active: item.is_active,
      metadata: {
        created_by: item.metadata.created_by?.toString(),
        updated_by: item.metadata.updated_by?.toString(),
      },
      created_at: item.created_at.toISOString(),
      updated_at: item.updated_at.toISOString(),
    }));

    res.status(200).json({
      message: 'Content blocks reordered successfully',
      items: response,
    });
  } catch (error) {
    next(error);
  }
};