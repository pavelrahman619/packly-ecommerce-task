# Design Decisions

This document outlines the key architectural and design decisions made during the development of the Dynamic Content Blocks API.

## 1. Unified Content Model Approach

### Decision
Use a single `ContentBlock` model with a flexible `data` field instead of separate models for each content type.

### Rationale
- **Simplicity**: Easier to query all content in a unified order
- **Flexibility**: Easy to add new content types without schema migrations
- **Maintainability**: Single model reduces code duplication
- **Performance**: Single collection queries are more efficient than joins
- **Scalability**: Easier to implement features like global search and ordering

### Implementation
```typescript
{
  content_type: string (enum),
  title: string,
  data: object (flexible JSON),
  order: number,
  is_active: boolean,
  metadata: { created_by, updated_by },
  timestamps: { created_at, updated_at }
}
```

### Trade-offs
- **Type Safety**: Requires careful validation of the `data` field
- **Query Complexity**: Type-specific queries require additional filtering
- **Schema Evolution**: Changes to content types require careful migration

## 2. Order Conflict Resolution Strategy

### Decision
Implement an auto-shift strategy that automatically resolves order conflicts by shifting existing items.

### Rationale
- **User Experience**: No manual intervention required for order conflicts
- **Data Integrity**: Maintains consistent ordering without gaps
- **Predictable Behavior**: Clear rules for how conflicts are resolved
- **Atomic Operations**: Uses MongoDB transactions for consistency

### Implementation
- **Insert/Update**: Shift items with order >= new_order up by 1
- **Reorder Single**: Shift items in range based on direction
- **Bulk Reorder**: Use temporary negative orders to avoid conflicts
- **Normalize**: Utility function to fix gaps (1, 2, 3, ...)

### Alternatives Considered
- **Gap-based ordering**: Allow gaps but requires normalization
- **Fractional ordering**: Use decimals but has precision limits
- **Linked list**: Complex to maintain and query

## 3. MongoDB Choice

### Decision
Use MongoDB with Mongoose ODM for data persistence.

### Rationale
- **Schema Flexibility**: Perfect for the flexible `data` field
- **JSON Native**: Natural fit for content management
- **Horizontal Scaling**: Easy to scale as content grows
- **Rich Queries**: Support for complex filtering and text search
- **Transactions**: Available for atomic operations

### Implementation Details
- **Indexes**: Compound indexes on `(is_active, order)` and `(content_type, is_active, order)`
- **Validation**: Schema-level validation combined with application validation
- **Transactions**: Used for complex ordering operations

### Alternatives Considered
- **PostgreSQL**: Better for relational data but less flexible for JSON
- **Redis**: Too ephemeral for persistent content
- **SQLite**: Not suitable for production scaling

## 4. Validation Approach

### Decision
Multi-layered validation using express-validator, Mongoose schemas, and custom content-type validation.

### Rationale
- **Defense in Depth**: Multiple validation layers prevent invalid data
- **Type-Specific Rules**: Each content type has specific validation rules
- **Clear Error Messages**: Field-specific error messages for better UX
- **Performance**: Early validation prevents unnecessary processing

### Implementation Layers
1. **Express-validator**: Request parameter and basic field validation
2. **Custom Middleware**: Content-type specific data validation
3. **Mongoose Schema**: Database-level constraints and validation
4. **Business Logic**: Complex rules in service layer

### Content Type Schemas
```typescript
ContentTypeDataSchemas = {
  text: { content: required, text_align: optional enum, ... },
  banner: { image_url: required URL, button_text: optional, ... },
  // ... other types
}
```

## 5. Error Handling Patterns

### Decision
Use custom error classes with specific HTTP status codes and structured error responses.

### Rationale
- **Consistency**: Uniform error response format across the API
- **Debugging**: Clear error types make debugging easier
- **Client Integration**: Predictable error structure for frontend handling
- **HTTP Standards**: Proper use of HTTP status codes

### Error Classes
- `ValidationError` (422): Field validation failures
- `NotFoundError` (404): Resource not found
- `ConflictError` (409): Business logic conflicts
- `BadRequestError` (400): Malformed requests
- `UnauthorizedError` (401): Authentication required
- `ForbiddenError` (403): Insufficient permissions

### Error Response Format
```json
{
  "success": false,
  "message": "Human readable error message",
  "errors": {
    "field_name": ["Specific field error messages"]
  }
}
```

## 6. Authentication & Authorization

### Decision
JWT-based authentication with role-based access control (admin-only write operations).

### Rationale
- **Stateless**: No server-side session storage required
- **Scalable**: Easy to scale across multiple server instances
- **Standard**: Industry-standard approach for API authentication
- **Flexible**: Can easily extend with more roles/permissions

### Implementation
- **Public Endpoints**: Read-only access to active content
- **Admin Endpoints**: Full CRUD operations require authentication
- **Token Structure**: Contains user ID and role information
- **Middleware Chain**: `authMiddleware` → `checkAdmin` → `controller`

### Security Considerations
- **Token Expiration**: Short-lived tokens with refresh mechanism
- **HTTPS Only**: Production tokens should only be sent over HTTPS
- **Secret Management**: JWT secret stored in environment variables

## 7. API Design Standards

### Decision
Follow RESTful API design principles with consistent URL patterns and HTTP methods.

### Rationale
- **Predictability**: Developers can guess API behavior
- **Standards Compliance**: Follows established REST conventions
- **Tooling Support**: Works well with standard HTTP tools
- **Caching**: HTTP caching strategies can be applied

### URL Patterns
```
GET    /api/content              # List with pagination/filtering
GET    /api/content/:id          # Get single item
POST   /api/content              # Create new item
PUT    /api/content/:id          # Update entire item
DELETE /api/content/:id          # Delete item
PATCH  /api/content/:id/order    # Partial update (reorder)
POST   /api/content/bulk-reorder # Bulk operation
```

### HTTP Status Codes
- `200 OK`: Successful GET, PUT, PATCH, DELETE
- `201 Created`: Successful POST
- `400 Bad Request`: Malformed request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Business logic conflict
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Unexpected server errors

## 8. Pagination Strategy

### Decision
Offset-based pagination with configurable limits and comprehensive metadata.

### Rationale
- **Simplicity**: Easy to understand and implement
- **UI Friendly**: Works well with page-based navigation
- **Flexibility**: Supports jumping to specific pages
- **Metadata Rich**: Provides all information needed for pagination UI

### Implementation
```typescript
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 150,
    pages: 15,
    hasNext: true,
    hasPrev: false
  }
}
```

### Alternatives Considered
- **Cursor-based**: Better for real-time data but more complex
- **Keyset pagination**: More efficient for large datasets but less flexible

## 9. Testing Strategy

### Decision
Comprehensive testing with unit tests for services and integration tests for controllers.

### Rationale
- **Confidence**: High test coverage provides confidence in changes
- **Documentation**: Tests serve as usage examples
- **Regression Prevention**: Catches breaking changes early
- **Refactoring Safety**: Enables safe code refactoring

### Testing Layers
1. **Unit Tests**: Services, utilities, and business logic
2. **Integration Tests**: Controllers with real database interactions
3. **End-to-End Tests**: Full API workflows (future consideration)

### Tools
- **Jest**: Test framework and assertion library
- **Supertest**: HTTP integration testing
- **MongoDB Memory Server**: In-memory database for tests
- **Test Coverage**: Aim for 80%+ coverage on critical paths

## 10. Documentation Approach

### Decision
Auto-generated API documentation using Swagger/OpenAPI 3.0 with JSDoc annotations.

### Rationale
- **Always Up-to-Date**: Generated from code, stays synchronized
- **Interactive**: Swagger UI allows testing endpoints
- **Standard Format**: OpenAPI is industry standard
- **Developer Experience**: Easy to explore and understand the API

### Implementation
- **JSDoc Comments**: Document controllers with @swagger annotations
- **Swagger UI**: Interactive documentation at `/api/docs`
- **OpenAPI JSON**: Machine-readable spec at `/api/docs.json`
- **Examples**: Include request/response examples for all endpoints

## Future Considerations

### Potential Improvements
1. **Caching Layer**: Redis for frequently accessed content
2. **Rate Limiting**: Prevent API abuse
3. **Audit Logging**: Track all changes for compliance
4. **Content Versioning**: Keep history of content changes
5. **Bulk Operations**: More efficient bulk create/update operations
6. **Search Enhancement**: Full-text search with Elasticsearch
7. **Real-time Updates**: WebSocket notifications for content changes
8. **Multi-tenancy**: Support for multiple organizations
9. **Content Scheduling**: Publish/unpublish content at specific times
10. **Asset Management**: File upload and CDN integration

### Scalability Considerations
- **Database Sharding**: Horizontal scaling of MongoDB
- **Load Balancing**: Multiple API server instances
- **CDN Integration**: Static asset delivery
- **Microservices**: Split into smaller, focused services
- **Event-Driven Architecture**: Decouple operations with message queues
