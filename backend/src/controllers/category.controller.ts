import { Request, Response, NextFunction } from "express";
import Category from "../db/models/category.model";
import Product from "../db/models/product.model";

// Get all categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      categories: categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url,
        parent_id: cat.parent_id
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Get products by category
export const getCategoryProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = "1", limit = "12", filters } = req.query;
    
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter query
    let filterQuery: any = { category_id: id };
    
    if (filters) {
      try {
        const parsedFilters = JSON.parse(filters as string);
        if (parsedFilters.price_min || parsedFilters.price_max) {
          filterQuery.price = {};
          if (parsedFilters.price_min) filterQuery.price.$gte = parsedFilters.price_min;
          if (parsedFilters.price_max) filterQuery.price.$lte = parsedFilters.price_max;
        }
        if (parsedFilters.color) {
          filterQuery["variants.color"] = parsedFilters.color;
        }
        if (parsedFilters.material) {
          filterQuery["variants.material"] = parsedFilters.material;
        }
      } catch (error) {
        console.error("Error parsing filters:", error);
      }
    }

    const [products, totalCount] = await Promise.all([
      Product.find(filterQuery)
        .skip(skip)
        .limit(limitNumber)
        .populate('category_id')
        .sort({ created_at: -1 }),
      Product.countDocuments(filterQuery)
    ]);

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      products,
      pagination: {
        current_page: pageNumber,
        total_pages: totalPages,
        total_count: totalCount,
        has_next: pageNumber < totalPages,
        has_prev: pageNumber > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

