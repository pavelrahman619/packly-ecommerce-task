<!-- 95f289ae-6b5c-4f35-a3a9-766349558e6b 9ef0f0c6-eed4-4b2f-a845-b5424961faf2 -->
# Dynamic Content Blocks API Implementation Plan

## Overview

Transform existing furniture backend into a focused content blocks management system by leveraging 70-80% of existing infrastructure and refactoring the content management system.

## Phase 1: Project Setup & Cleanup

### 1.1 Create New Repository

- Clone existing project to new workspace/repo
- Remove unnecessary dependencies from `package.json`: web-push, socket.io, stripe-related packages
- Keep: express, mongoose, jwt, cors, helmet, morgan, express-validator, typescript, jest

### 1.2 Cleanup Unnecessary Files

**Remove these files/folders:**

- `src/controllers/`: cart, order, payment, delivery, upload, product, category, user (keep: admin, auth, content)
- `src/routes/`: cart, order, payment, delivery, upload, product, category, user (keep: admin, auth, content)
- `src/models/`: cart, order, product, category, user (keep: content model for refactoring)
- `src/types/`: cart, order, product, category, user (keep: content types)
- Frontend folder (not needed for API-only project)
- Socket.io setup in `server.ts`

## Phase 2: Core Content Model Refactoring

### 2.1 Create Unified ContentBlock Model

**File:** `src/db/models/contentBlock.model.ts`

Replace separate content models with single flexible model:

```typescript
{
  content_type: string (enum: 'text', 'banner', 'card', 'hero', 'cta'),
  title: string (required),
  data: object (flexible JSON for type-specific fields),
  order: number (required, indexed),
  is_active: boolean (default: true),
  metadata: {
    created_by: ObjectId (ref: User),
    updated_by: ObjectId (ref: User)
  },
  timestamps: true
}
```

**Key additions:**

- Compound index on `(is_active, order)` for fast querying
- Pre-save hook to handle order conflicts
- Static methods for reordering logic

### 2.2 Create ContentBlock Type Interface

**File:** `src/types/contentBlock.type.ts`

Define TypeScript interfaces for content types and validation schemas.

## Phase 3: Controller Implementation

### 3.1 Refactor Content Controller

**File:** `src/controllers/content.controller.ts`

Implement full CRUD + ordering operations:

**Required Endpoints:**

1. `getAllContent` - GET with query params (active, sort, order, page, limit)
2. `getContentById` - GET single item with validation
3. `createContent` - POST with validation, auto-assign order
4. `updateContent` - PUT/PATCH with validation
5. `deleteContent` - DELETE with proper error handling
6. `reorderContent` - PATCH for single item reorder
7. `bulkReorderContent` - POST for multiple items

**Edge Case Handling:**

- Invalid IDs return 404 with clear message
- Invalid query params return 400 with validation errors
- Order conflicts auto-resolve (shift other items)
- Missing required fields return 422 with field-specific errors
- Delete non-existent returns 404

## Phase 4: Validation Layer

### 4.1 Create Validation Middleware

**File:** `src/middleware/validation.middleware.ts`

Use `express-validator` to create reusable validators:

- `validateCreateContent` - required fields, content_type enum, data structure
- `validateUpdateContent` - optional fields, ID validation
- `validateQuery` - pagination, sort direction, filters
- `validateReorder` - order value, ID existence
- `validateBulkReorder` - array of {id, order} objects

### 4.2 Create Custom Error Classes

**File:** `src/lib/errors.ts`

Define error classes for better error handling:

- `ValidationError` (422)
- `NotFoundError` (404)
- `ConflictError` (409)
- `BadRequestError` (400)

## Phase 5: Ordering Logic

### 5.1 Create Ordering Service

**File:** `src/services/ordering.service.ts`

Implement complex ordering operations:

- `assignNextOrder()` - get next available order number
- `reorderSingle()` - move item, shift others
- `reorderBulk()` - atomic bulk update with conflict resolution
- `normalizeOrders()` - fix gaps in sequence
- `handleOrderConflict()` - resolve duplicate orders

**Conflict Resolution Strategy:**

- When duplicate order detected, shift existing items up by 1
- Bulk operations use transactions for atomicity
- Return updated items in response

## Phase 6: Routes Configuration

### 6.1 Update Content Routes

**File:** `src/routes/content.router.ts`

```typescript
// Public routes (no auth)
GET    /api/content              // Get all (active only by default)
GET    /api/content/:id          // Get single

// Admin routes (require auth + admin role)
POST   /api/content              // Create
PUT    /api/content/:id          // Update
DELETE /api/content/:id          // Delete
PATCH  /api/content/:id/order    // Reorder single
POST   /api/content/bulk-reorder // Bulk reorder
```

Apply middleware chain: validation → auth → admin check → controller

### 6.2 Update Server Routes

**File:** `src/server.ts`

Remove unused route imports, keep only: auth, admin, content routes

## Phase 7: Pagination & Filtering

### 7.1 Create Pagination Utility

**File:** `src/lib/pagination.ts`

Reusable pagination helper:

- Parse page/limit from query
- Build MongoDB skip/limit
- Generate metadata (total, pages, hasNext, hasPrev)
- Default: page=1, limit=10, max=100

### 7.2 Add Filtering Support

Extend `getAllContent` controller to support:

- `content_type` filter (single or comma-separated)
- `is_active` filter (true/false)
- `search` (title/data text search)
- `sort_by` (order, created_at, updated_at)
- `sort_direction` (asc, desc)

## Phase 8: API Documentation

### 8.1 Setup Swagger

**Install:** `swagger-ui-express`, `swagger-jsdoc`

**File:** `src/config/swagger.ts`

Configure OpenAPI 3.0 spec:

- API info, version, description
- Server URLs (dev/prod)
- Security schemes (Bearer JWT)
- Tag organization

### 8.2 Document Endpoints

Add JSDoc comments to all controller functions with:

- @swagger annotations
- Request/response schemas
- Example requests
- Error responses

**Route:** `GET /api/docs` - Swagger UI

**Route:** `GET /api/docs.json` - OpenAPI spec

## Phase 9: Testing

### 9.1 Update Test Setup

**File:** `src/tests/setup.ts`

Configure test database connection, cleanup helpers

### 9.2 Create Controller Tests

**File:** `src/tests/controllers/content.controller.test.ts`

Test coverage for:

- All CRUD operations (happy path)
- Edge cases (invalid IDs, missing fields, order conflicts)
- Validation errors
- Authentication/authorization
- Pagination
- Ordering logic

**File:** `src/tests/services/ordering.service.test.ts`

Test ordering logic in isolation

**Target:** 80%+ coverage on core functionality

## Phase 10: Documentation & Polish

### 10.1 Update README

**File:** `README.md`

Include:

- Project description & purpose
- Tech stack
- Setup instructions (env vars, MongoDB, dependencies)
- Running the server
- Running tests
- API documentation link
- Design decisions section

### 10.2 Create Design Decisions Doc

**File:** `DESIGN_DECISIONS.md`

Document:

- Why single ContentBlock model (flexibility, scalability)
- Order conflict resolution strategy
- MongoDB choice (schema flexibility)
- Validation approach
- Error handling patterns

### 10.3 Create API Examples

**File:** `API_EXAMPLES.md`

Provide curl/Postman examples for:

- Creating different content types
- Reordering items
- Pagination
- Filtering
- Error scenarios

### 10.4 Create Postman Collection

Update existing Postman collection with all new endpoints and examples

## Key Design Decisions

**1. Unified Model Approach**

- Single `ContentBlock` model with flexible `data` field
- Easier to query all content in order
- Type safety via TypeScript interfaces
- Extensible for new content types

**2. Order Conflict Resolution**

- Auto-shift strategy prevents gaps
- Transactions for bulk operations
- Normalize operation for maintenance

**3. Validation Strategy**

- Express-validator for declarative validation
- Type-specific data validation
- Clear, field-specific error messages

**4. REST Standards**

- Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Appropriate status codes (200, 201, 400, 404, 422)
- Consistent response format
- Meaningful error messages

**5. Security**

- JWT authentication required for write operations
- Admin-only access to management endpoints
- Public read access to active content
- Input sanitization via validation

## Estimated Time: 6-8 hours

- Phase 1-2: 1-1.5 hours
- Phase 3-5: 2-3 hours
- Phase 6-7: 1 hour
- Phase 8: 1-1.5 hours
- Phase 9-10: 1.5-2 hours

### To-dos

- [x] Clone project, remove unnecessary dependencies and files (cart, orders, products, etc.)
- [ ] Create unified ContentBlock model with ordering, timestamps, and flexible data field
- [ ] Implement ordering service with conflict resolution and bulk operations
- [ ] Create validation middleware and custom error classes
- [ ] Refactor content controller with full CRUD, pagination, filtering, and reordering
- [ ] Update routes with proper REST endpoints, authentication, and admin middleware
- [ ] Setup Swagger/OpenAPI documentation with all endpoints documented
- [ ] Write comprehensive tests for controllers, services, and edge cases
- [ ] Update README, create design decisions doc, and API examples