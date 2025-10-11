# Furniture eCommerce API - Postman Collection

This repository includes a comprehensive Postman collection for testing the Furniture eCommerce API with sample requests and responses.

## 📁 Files Included

- `Furniture_eCommerce_API.postman_collection.json` - Complete API collection
- `Furniture_eCommerce_Environment.postman_environment.json` - Environment variables
- `POSTMAN_COLLECTION_README.md` - This documentation

## 🚀 Quick Start

### 1. Import Collection & Environment

1. Open Postman
2. Click **Import** button
3. Select both files:
   - `Furniture_eCommerce_API.postman_collection.json`
   - `Furniture_eCommerce_Environment.postman_environment.json`
4. Select **Furniture eCommerce Environment** from the environment dropdown

### 2. Update Environment Variables

Before testing, update these variables in your environment:

| Variable           | Description        | Default Value           |
| ------------------ | ------------------ | ----------------------- |
| `baseUrl`          | API server URL     | `http://localhost:8080` |
| `testUserEmail`    | Test user email    | `user@example.com`      |
| `testUserPassword` | Test user password | `password123`           |
| `adminEmail`       | Admin user email   | `admin@example.com`     |
| `adminPassword`    | Admin password     | `admin123`              |

### 3. Authentication Flow

1. **Login First**: Use the `🔐 Authentication > Login` request
2. **Auto Token**: The auth token is automatically saved to `{{authToken}}` variable
3. **Protected Endpoints**: Most endpoints use the Bearer token automatically

## 📋 API Endpoints Overview

### 🔐 Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

### 🛋️ Products

- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/:id/stock` - Get product stock
- `PUT /api/products/:id/stock` - Update stock (Admin)

### 📂 Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id/products` - Get products by category

### 🛒 Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove from cart

### 📦 Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/:id/track` - Track order

### 🌐 Content Management

- `GET /api/content/banner` - Get banner content
- `PUT /api/content/banner` - Update banner (Admin)
- `GET /api/content/sale-section` - Get sale section
- `PUT /api/content/sale-section` - Update sale section (Admin)
- `GET /api/content/featured-products` - Get featured products
- `PUT /api/content/featured-products` - Update featured (Admin)
- `GET /api/content/footer` - Get footer content
- `PUT /api/content/footer` - Update footer (Admin)

### 🚚 Delivery

- `POST /api/delivery/validate-address` - Validate delivery address
- `POST /api/delivery/calculate-cost` - Calculate delivery cost

### 💳 Payment

- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/payment/confirm` - Confirm payment

### 👑 Admin

- `GET /api/admin/dashboard` - Get dashboard statistics

### 📤 File Upload

- `POST /api/upload/image` - Upload single image
- `POST /api/upload/bulk-images` - Upload multiple images

## 🔍 Product Filtering Examples

The products endpoint supports comprehensive filtering:

```http
GET /api/products?page=1&limit=12&category=64f123...&price_min=100&price_max=1000&color=brown&material=wood&search=sofa
```

**Available Filters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `category` - Category ID
- `price_min` - Minimum price
- `price_max` - Maximum price
- `color` - Color filter (case-insensitive)
- `material` - Material filter (case-insensitive)
- `search` - Search in name/description

## 📝 Sample Data

The collection includes realistic sample data for:

### Product Creation

```json
{
  "name": "Modern Leather Sofa",
  "sku": "SOF-001",
  "category": "64f123abc456def789012345",
  "price": 799.99,
  "description": "Comfortable 3-seater leather sofa",
  "variants": [
    {
      "color": "Brown",
      "material": "Leather",
      "size": "Large",
      "price": 799.99,
      "stock": 15,
      "sku": "SOF-001-BR-L"
    }
  ],
  "images": [
    {
      "url": "https://example.com/images/sofa-1.jpg",
      "alt": "Modern Leather Sofa - Front View",
      "is_primary": true
    }
  ]
}
```

### Order Creation

```json
{
  "items": [
    {
      "product_id": "64f123abc456def789012345",
      "variant_id": "64f123abc456def789012346",
      "quantity": 2,
      "price": 799.99
    }
  ],
  "shipping_address": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA",
    "phone": "+1-555-123-4567"
  },
  "payment_method": "stripe"
}
```

## 🧪 Testing Features

### Automatic Token Management

- Login saves token to `{{authToken}}` variable
- All protected endpoints use this token automatically
- No manual token copying required

### Global Test Scripts

- Automatic status code validation (200-299 range)
- Response time monitoring
- Auto-save authentication tokens

### Environment Variables

- Easy switching between development/staging/production
- Pre-configured test data IDs
- Secure credential storage

## 🚀 Advanced Usage

### Running Collections

```bash
# Install Newman (Postman CLI)
npm install -g newman

# Run entire collection
newman run Furniture_eCommerce_API.postman_collection.json \
  -e Furniture_eCommerce_Environment.postman_environment.json

# Run specific folder
newman run Furniture_eCommerce_API.postman_collection.json \
  -e Furniture_eCommerce_Environment.postman_environment.json \
  --folder "Products"
```

### CI/CD Integration

The collection can be integrated into CI/CD pipelines for automated API testing.

## 🔧 Troubleshooting

### Common Issues

1. **401 Unauthorized**: Ensure you've logged in and the token is saved
2. **404 Not Found**: Check that your server is running on the correct port
3. **500 Server Error**: Verify database connection and server configuration

### Environment Setup

1. Ensure your API server is running
2. Update `baseUrl` to match your server
3. Create test user accounts in your database
4. Verify all endpoints are accessible

## 📚 Additional Resources

- API Documentation: Check your server's `/docs` endpoint if available
- Server Repository: Link to your main API repository
- Issue Tracking: Report bugs or request features

---

**Happy Testing!** 🎉

For questions or issues, please refer to the main project documentation or create an issue in the repository.
