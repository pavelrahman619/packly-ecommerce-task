import { Document, Types } from "mongoose";

// Content type enum
export enum ContentType {
  TEXT = 'text',
  BANNER = 'banner',
  CARD = 'card',
  HERO = 'hero',
  CTA = 'cta',
}

// Base content block interface
export interface IContentBlock extends Document {
  content_type: ContentType;
  title: string;
  data: Record<string, any>;
  order: number;
  is_active: boolean;
  metadata: {
    created_by?: Types.ObjectId;
    updated_by?: Types.ObjectId;
  };
  created_at: Date;
  updated_at: Date;
}

// Type-specific data interfaces
export interface ITextBlockData {
  content: string;
  text_align?: 'left' | 'center' | 'right';
  font_size?: 'small' | 'medium' | 'large';
}

export interface IBannerBlockData {
  image_url: string;
  alt_text?: string;
  button_text?: string;
  button_link?: string;
  overlay_text?: string;
}

export interface ICardBlockData {
  image_url?: string;
  alt_text?: string;
  description: string;
  button_text?: string;
  button_link?: string;
  card_style?: 'default' | 'outlined' | 'elevated';
}

export interface IHeroBlockData {
  background_image?: string;
  background_color?: string;
  subtitle?: string;
  description: string;
  primary_button?: {
    text: string;
    link: string;
  };
  secondary_button?: {
    text: string;
    link: string;
  };
}

export interface ICTABlockData {
  description: string;
  button_text: string;
  button_link: string;
  background_color?: string;
  text_color?: string;
  button_style?: 'primary' | 'secondary' | 'outline';
}

// Union type for all data types
export type ContentBlockData = 
  | ITextBlockData 
  | IBannerBlockData 
  | ICardBlockData 
  | IHeroBlockData 
  | ICTABlockData;

// Request/Response DTOs
export interface ICreateContentBlockRequest {
  content_type: ContentType;
  title: string;
  data: ContentBlockData;
  order?: number;
  is_active?: boolean;
}

export interface IUpdateContentBlockRequest {
  title?: string;
  data?: ContentBlockData;
  order?: number;
  is_active?: boolean;
}

export interface IContentBlockResponse {
  _id: string;
  content_type: ContentType;
  title: string;
  data: Record<string, any>;
  order: number;
  is_active: boolean;
  metadata: {
    created_by?: string;
    updated_by?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface IGetAllContentBlocksQuery {
  content_type?: ContentType | ContentType[];
  is_active?: boolean;
  search?: string;
  sort_by?: 'order' | 'created_at' | 'updated_at' | 'title';
  sort_direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IReorderRequest {
  order: number;
}

export interface IBulkReorderRequest {
  items: Array<{
    id: string;
    order: number;
  }>;
}

// Validation schemas for different content types
export const ContentTypeDataSchemas = {
  [ContentType.TEXT]: {
    content: { required: true, type: 'string', maxLength: 5000 },
    text_align: { required: false, type: 'string', enum: ['left', 'center', 'right'] },
    font_size: { required: false, type: 'string', enum: ['small', 'medium', 'large'] },
  },
  [ContentType.BANNER]: {
    image_url: { required: true, type: 'string', format: 'url' },
    alt_text: { required: false, type: 'string', maxLength: 200 },
    button_text: { required: false, type: 'string', maxLength: 50 },
    button_link: { required: false, type: 'string', format: 'url' },
    overlay_text: { required: false, type: 'string', maxLength: 200 },
  },
  [ContentType.CARD]: {
    image_url: { required: false, type: 'string', format: 'url' },
    alt_text: { required: false, type: 'string', maxLength: 200 },
    description: { required: true, type: 'string', maxLength: 1000 },
    button_text: { required: false, type: 'string', maxLength: 50 },
    button_link: { required: false, type: 'string', format: 'url' },
    card_style: { required: false, type: 'string', enum: ['default', 'outlined', 'elevated'] },
  },
  [ContentType.HERO]: {
    background_image: { required: false, type: 'string', format: 'url' },
    background_color: { required: false, type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    subtitle: { required: false, type: 'string', maxLength: 200 },
    description: { required: true, type: 'string', maxLength: 1000 },
    primary_button: {
      required: false,
      type: 'object',
      properties: {
        text: { required: true, type: 'string', maxLength: 50 },
        link: { required: true, type: 'string', format: 'url' },
      },
    },
    secondary_button: {
      required: false,
      type: 'object',
      properties: {
        text: { required: true, type: 'string', maxLength: 50 },
        link: { required: true, type: 'string', format: 'url' },
      },
    },
  },
  [ContentType.CTA]: {
    description: { required: true, type: 'string', maxLength: 500 },
    button_text: { required: true, type: 'string', maxLength: 50 },
    button_link: { required: true, type: 'string', format: 'url' },
    background_color: { required: false, type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    text_color: { required: false, type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
    button_style: { required: false, type: 'string', enum: ['primary', 'secondary', 'outline'] },
  },
};

// Error response interfaces
export interface IErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export interface IValidationError {
  field: string;
  message: string;
  value?: any;
}

// Validation function export
export const validateContentTypeData = (contentType: ContentType, data: any): IValidationError[] => {
  const schema = ContentTypeDataSchemas[contentType];
  const errors: IValidationError[] = [];

  if (!schema) {
    errors.push({
      field: 'content_type',
      message: `Invalid content type: ${contentType}`,
    });
    return errors;
  }

  // Check required fields
  Object.entries(schema).forEach(([field, rules]: [string, any]) => {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: `data.${field}`,
        message: `${field} is required`,
      });
      return;
    }

    if (value !== undefined && value !== null) {
      // Type validation
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push({
          field: `data.${field}`,
          message: `${field} must be a string`,
          value,
        });
      } else if (rules.type === 'number' && typeof value !== 'number') {
        errors.push({
          field: `data.${field}`,
          message: `${field} must be a number`,
          value,
        });
      } else if (rules.type === 'object' && typeof value !== 'object') {
        errors.push({
          field: `data.${field}`,
          message: `${field} must be an object`,
          value,
        });
      }

      // String validations
      if (typeof value === 'string') {
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({
            field: `data.${field}`,
            message: `${field} must not exceed ${rules.maxLength} characters`,
            value,
          });
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push({
            field: `data.${field}`,
            message: `${field} must be one of: ${rules.enum.join(', ')}`,
            value,
          });
        }

        if (rules.pattern) {
          const regex = new RegExp(rules.pattern);
          if (!regex.test(value)) {
            errors.push({
              field: `data.${field}`,
              message: `${field} format is invalid`,
              value,
            });
          }
        }

        if (rules.format === 'url') {
          try {
            new URL(value);
          } catch {
            errors.push({
              field: `data.${field}`,
              message: `${field} must be a valid URL`,
              value,
            });
          }
        }
      }

      // Object validations
      if (rules.type === 'object' && rules.properties && typeof value === 'object') {
        Object.entries(rules.properties).forEach(([propKey, propRules]: [string, any]) => {
          const propValue = value[propKey];
          
          if (propRules.required && (propValue === undefined || propValue === null || propValue === '')) {
            errors.push({
              field: `data.${field}.${propKey}`,
              message: `${propKey} is required`,
            });
          }

          if (propValue !== undefined && propValue !== null) {
            if (propRules.type === 'string' && typeof propValue !== 'string') {
              errors.push({
                field: `data.${field}.${propKey}`,
                message: `${propKey} must be a string`,
                value: propValue,
              });
            }

            if (typeof propValue === 'string' && propRules.maxLength && propValue.length > propRules.maxLength) {
              errors.push({
                field: `data.${field}.${propKey}`,
                message: `${propKey} must not exceed ${propRules.maxLength} characters`,
                value: propValue,
              });
            }

            if (propRules.format === 'url' && typeof propValue === 'string') {
              try {
                new URL(propValue);
              } catch {
                errors.push({
                  field: `data.${field}.${propKey}`,
                  message: `${propKey} must be a valid URL`,
                  value: propValue,
                });
              }
            }
          }
        });
      }
    }
  });

  return errors;
};
