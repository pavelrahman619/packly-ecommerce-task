# API Examples

This document provides comprehensive examples of how to use the Dynamic Content Blocks API, including curl commands, JavaScript/Node.js examples, and common use cases.

## Authentication

All write operations require authentication. First, obtain a JWT token:

```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Use the token in subsequent requests:
```bash
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Content Block Examples

### 1. Text Block

#### Create a Text Block
```bash
curl -X POST "http://localhost:8080/api/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "text",
    "title": "Welcome Message",
    "data": {
      "content": "Welcome to our amazing platform! We provide the best service in the industry.",
      "text_align": "center",
      "font_size": "large"
    },
    "order": 1,
    "is_active": true
  }'
```

#### JavaScript Example
```javascript
const createTextBlock = async (token) => {
  const response = await fetch('http://localhost:8080/api/content', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content_type: 'text',
      title: 'About Us',
      data: {
        content: 'We are a leading company in our field with over 10 years of experience.',
        text_align: 'left',
        font_size: 'medium'
      },
      order: 2,
      is_active: true
    })
  });
  
  return await response.json();
};
```

### 2. Banner Block

#### Create a Banner Block
```bash
curl -X POST "http://localhost:8080/api/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "banner",
    "title": "Hero Banner",
    "data": {
      "image_url": "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200",
      "alt_text": "Beautiful landscape banner",
      "button_text": "Learn More",
      "button_link": "https://example.com/learn-more",
      "overlay_text": "Discover Amazing Features"
    },
    "order": 1
  }'
```

#### Response
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "content_type": "banner",
  "title": "Hero Banner",
  "data": {
    "image_url": "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200",
    "alt_text": "Beautiful landscape banner",
    "button_text": "Learn More",
    "button_link": "https://example.com/learn-more",
    "overlay_text": "Discover Amazing Features"
  },
  "order": 1,
  "is_active": true,
  "metadata": {
    "created_by": "64f8a1b2c3d4e5f6a7b8c9d1",
    "updated_by": "64f8a1b2c3d4e5f6a7b8c9d1"
  },
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### 3. Card Block

#### Create a Card Block
```bash
curl -X POST "http://localhost:8080/api/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "card",
    "title": "Feature Card",
    "data": {
      "image_url": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
      "alt_text": "Feature illustration",
      "description": "This amazing feature will revolutionize the way you work. Experience unprecedented efficiency and productivity.",
      "button_text": "Try Now",
      "button_link": "https://example.com/try-now",
      "card_style": "elevated"
    },
    "order": 3
  }'
```

### 4. Hero Block

#### Create a Hero Block
```bash
curl -X POST "http://localhost:8080/api/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "hero",
    "title": "Main Hero Section",
    "data": {
      "background_image": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920",
      "background_color": "#1a202c",
      "subtitle": "The Future is Here",
      "description": "Join thousands of satisfied customers who have transformed their business with our innovative solutions.",
      "primary_button": {
        "text": "Get Started",
        "link": "https://example.com/signup"
      },
      "secondary_button": {
        "text": "Watch Demo",
        "link": "https://example.com/demo"
      }
    },
    "order": 1
  }'
```

### 5. CTA Block

#### Create a CTA Block
```bash
curl -X POST "http://localhost:8080/api/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "cta",
    "title": "Newsletter Signup",
    "data": {
      "description": "Stay updated with our latest news and exclusive offers. Join our newsletter today!",
      "button_text": "Subscribe Now",
      "button_link": "https://example.com/newsletter",
      "background_color": "#3182ce",
      "text_color": "#ffffff",
      "button_style": "primary"
    },
    "order": 10
  }'
```

## Querying Content

### Get All Content Blocks

#### Basic Query
```bash
curl -X GET "http://localhost:8080/api/content"
```

#### With Pagination
```bash
curl -X GET "http://localhost:8080/api/content?page=2&limit=5"
```

#### Filter by Content Type
```bash
curl -X GET "http://localhost:8080/api/content?content_type=banner,hero"
```

#### Search Content
```bash
curl -X GET "http://localhost:8080/api/content?search=welcome"
```

#### Complex Query
```bash
curl -X GET "http://localhost:8080/api/content?content_type=text,card&is_active=true&search=feature&sort_by=created_at&sort_direction=desc&page=1&limit=10"
```

#### JavaScript Example
```javascript
const getContentBlocks = async (options = {}) => {
  const params = new URLSearchParams();
  
  if (options.contentType) params.append('content_type', options.contentType);
  if (options.isActive !== undefined) params.append('is_active', options.isActive);
  if (options.search) params.append('search', options.search);
  if (options.sortBy) params.append('sort_by', options.sortBy);
  if (options.sortDirection) params.append('sort_direction', options.sortDirection);
  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  
  const response = await fetch(`http://localhost:8080/api/content?${params}`);
  return await response.json();
};

// Usage
const result = await getContentBlocks({
  contentType: 'banner,hero',
  isActive: true,
  sortBy: 'order',
  page: 1,
  limit: 10
});
```

### Get Single Content Block

```bash
curl -X GET "http://localhost:8080/api/content/64f8a1b2c3d4e5f6a7b8c9d0"
```

## Updating Content

### Update a Content Block
```bash
curl -X PUT "http://localhost:8080/api/content/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Hero Banner",
    "data": {
      "image_url": "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200",
      "alt_text": "Updated beautiful landscape banner",
      "button_text": "Discover More",
      "button_link": "https://example.com/discover",
      "overlay_text": "Experience Innovation"
    },
    "is_active": true
  }'
```

### Partial Update (JavaScript)
```javascript
const updateContentBlock = async (id, updates, token) => {
  const response = await fetch(`http://localhost:8080/api/content/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  return await response.json();
};
```

## Reordering Content

### Reorder Single Item
```bash
curl -X PATCH "http://localhost:8080/api/content/64f8a1b2c3d4e5f6a7b8c9d0/order" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order": 5}'
```

### Bulk Reorder
```bash
curl -X POST "http://localhost:8080/api/content/bulk-reorder" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "64f8a1b2c3d4e5f6a7b8c9d0", "order": 1},
      {"id": "64f8a1b2c3d4e5f6a7b8c9d1", "order": 2},
      {"id": "64f8a1b2c3d4e5f6a7b8c9d2", "order": 3},
      {"id": "64f8a1b2c3d4e5f6a7b8c9d3", "order": 4}
    ]
  }'
```

#### JavaScript Drag-and-Drop Example
```javascript
const reorderContentBlocks = async (reorderedItems, token) => {
  const items = reorderedItems.map((item, index) => ({
    id: item.id,
    order: index + 1
  }));
  
  const response = await fetch('http://localhost:8080/api/content/bulk-reorder', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  });
  
  return await response.json();
};
```

## Deleting Content

### Delete a Content Block
```bash
curl -X DELETE "http://localhost:8080/api/content/64f8a1b2c3d4e5f6a7b8c9d0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### JavaScript Example
```javascript
const deleteContentBlock = async (id, token) => {
  const response = await fetch(`http://localhost:8080/api/content/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

## Error Handling Examples

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": ["title must be between 1 and 200 characters"],
    "data.image_url": ["image_url must be a valid URL"],
    "order": ["order must be a non-negative integer"]
  }
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Content block with ID 64f8a1b2c3d4e5f6a7b8c9d0 not found"
}
```

### JavaScript Error Handling
```javascript
const handleApiCall = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/content', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contentData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      if (result.errors) {
        // Handle validation errors
        Object.entries(result.errors).forEach(([field, messages]) => {
          console.error(`${field}: ${messages.join(', ')}`);
        });
      } else {
        // Handle other errors
        console.error(result.message);
      }
      throw new Error(result.message);
    }
    
    return result;
  } catch (error) {
    console.error('API call failed:', error.message);
    throw error;
  }
};
```

## Common Use Cases

### 1. Building a Homepage

```javascript
// Get all active content blocks for homepage
const getHomepageContent = async () => {
  const response = await fetch('http://localhost:8080/api/content?is_active=true&sort_by=order&sort_direction=asc');
  const result = await response.json();
  
  return result.data.reduce((sections, block) => {
    sections[block.content_type] = sections[block.content_type] || [];
    sections[block.content_type].push(block);
    return sections;
  }, {});
};

// Usage
const homepageContent = await getHomepageContent();
// Returns: { hero: [...], text: [...], banner: [...], card: [...], cta: [...] }
```

### 2. Content Management Dashboard

```javascript
// Get paginated content for admin dashboard
const getDashboardContent = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort_by: 'updated_at',
    sort_direction: 'desc'
  });
  
  if (filters.contentType) params.append('content_type', filters.contentType);
  if (filters.search) params.append('search', filters.search);
  if (filters.isActive !== undefined) params.append('is_active', filters.isActive);
  
  const response = await fetch(`http://localhost:8080/api/content?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};
```

### 3. Content Preview

```javascript
// Get content for preview (including inactive items)
const getPreviewContent = async (token) => {
  const response = await fetch('http://localhost:8080/api/content?sort_by=order', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};
```

### 4. Batch Content Creation

```javascript
const createMultipleBlocks = async (blocks, token) => {
  const results = [];
  
  for (const block of blocks) {
    try {
      const response = await fetch('http://localhost:8080/api/content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(block)
      });
      
      const result = await response.json();
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
};
```

## Postman Collection

You can import this collection into Postman for easy API testing:

```json
{
  "info": {
    "name": "Dynamic Content Blocks API",
    "description": "Complete API collection for content management"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": "{{jwt_token}}"
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"password\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Content Blocks",
      "item": [
        {
          "name": "Get All Content",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/content?page=1&limit=10",
              "host": ["{{baseUrl}}"],
              "path": ["api", "content"],
              "query": [
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

This collection includes all the main endpoints with example requests and can be easily imported into Postman for testing.
