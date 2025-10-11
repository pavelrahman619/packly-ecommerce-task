import { Request } from 'express';
import { IGetAllContentBlocksQuery, IPaginatedResponse } from '../types/contentBlock.type';

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface IPaginationResult {
  skip: number;
  limit: number;
  page: number;
}

export interface IPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginationHelper {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 100;

  /**
   * Parse pagination parameters from request query
   */
  static parsePaginationParams(query: IGetAllContentBlocksQuery): IPaginationResult {
    const page = Math.max(1, parseInt(String(query.page)) || this.DEFAULT_PAGE);
    const limit = Math.min(
      this.MAX_LIMIT,
      Math.max(1, parseInt(String(query.limit)) || this.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    return { skip, limit, page };
  }

  /**
   * Generate pagination metadata
   */
  static generateMetadata(
    page: number,
    limit: number,
    total: number
  ): IPaginationMetadata {
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    return {
      page,
      limit,
      total,
      pages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Create paginated response
   */
  static createPaginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): IPaginatedResponse<T> {
    return {
      data,
      pagination: this.generateMetadata(page, limit, total),
    };
  }

  /**
   * Parse sorting parameters from request query
   */
  static parseSortParams(query: IGetAllContentBlocksQuery): Record<string, 1 | -1> {
    const sortBy = query.sort_by || 'order';
    const sortDirection = query.sort_direction === 'desc' ? -1 : 1;

    return { [sortBy]: sortDirection };
  }

  /**
   * Build MongoDB filter from query parameters
   */
  static buildFilter(query: IGetAllContentBlocksQuery): Record<string, any> {
    const filter: Record<string, any> = {};

    // Filter by active status
    if (query.is_active !== undefined) {
      filter.is_active = query.is_active;
    } else {
      // Default to active items only for public endpoints
      filter.is_active = true;
    }

    // Filter by content type(s)
    if (query.content_type) {
      if (Array.isArray(query.content_type)) {
        filter.content_type = { $in: query.content_type };
      } else if (typeof query.content_type === 'string' && query.content_type.includes(',')) {
        const types = query.content_type.split(',').map(t => t.trim());
        filter.content_type = { $in: types };
      } else {
        filter.content_type = query.content_type;
      }
    }

    // Text search
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { 'data.content': { $regex: query.search, $options: 'i' } },
        { 'data.description': { $regex: query.search, $options: 'i' } },
        { 'data.overlay_text': { $regex: query.search, $options: 'i' } },
      ];
    }

    return filter;
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(page?: number, limit?: number): string[] {
    const errors: string[] = [];

    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 1) {
        errors.push('Page must be a positive integer');
      }
    }

    if (limit !== undefined) {
      if (!Number.isInteger(limit) || limit < 1 || limit > this.MAX_LIMIT) {
        errors.push(`Limit must be between 1 and ${this.MAX_LIMIT}`);
      }
    }

    return errors;
  }

  /**
   * Extract pagination info from request for logging
   */
  static extractPaginationInfo(req: Request): string {
    const { page, limit, sort_by, sort_direction } = req.query;
    return `page=${page || this.DEFAULT_PAGE}, limit=${limit || this.DEFAULT_LIMIT}, sort=${sort_by || 'order'}:${sort_direction || 'asc'}`;
  }
}
