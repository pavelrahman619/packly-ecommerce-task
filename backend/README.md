# Dynamic Content Blocks API

A flexible and scalable content management API for dynamic content blocks. This API allows you to create, manage, and organize various types of content blocks (text, banners, cards, hero sections, CTAs) with advanced ordering and filtering capabilities.

## 🚀 Features

- **Unified Content Model**: Single flexible model supporting multiple content types
- **Advanced Ordering**: Drag-and-drop style reordering with conflict resolution
- **Flexible Data Structure**: JSON-based data field for type-specific content
- **Comprehensive Validation**: Type-specific validation for each content block type
- **Pagination & Filtering**: Advanced query capabilities with search functionality
- **RESTful API**: Standard HTTP methods with proper status codes
- **Authentication & Authorization**: JWT-based auth with admin-only write operations
- **Comprehensive Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Type Safety**: Full TypeScript implementation
- **Comprehensive Testing**: Unit and integration tests with high coverage

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint, Prettier, Husky

## 📋 Content Block Types

The API supports five types of content blocks:

1. **Text Block** (`text`): Rich text content with formatting options
2. **Banner Block** (`banner`): Image banners with optional overlay text and buttons
3. **Card Block** (`card`): Content cards with image, description, and call-to-action
4. **Hero Block** (`hero`): Full-width hero sections with background and multiple buttons
5. **CTA Block** (`cta`): Call-to-action blocks with customizable styling

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/content-blocks
   JWT_SECRET=your-super-secret-jwt-key
   API_URL=http://localhost:8080
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8080`

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8080/api/docs`
- **OpenAPI JSON**: `http://localhost:8080/api/docs.json`

## 📚 API Endpoints

### Public Endpoints (No Authentication)

- `GET /api/content` - Get all active content blocks with pagination and filtering
- `GET /api/content/:id` - Get a specific content block by ID

### Admin Endpoints (Authentication Required)

- `POST /api/content` - Create a new content block
- `PUT /api/content/:id` - Update an existing content block
- `DELETE /api/content/:id` - Delete a content block
- `PATCH /api/content/:id/order` - Reorder a single content block
- `POST /api/content/bulk-reorder` - Bulk reorder multiple content blocks

### Authentication Endpoints

- `POST /api/auth/login` - Admin login
- `POST /api/auth/refresh` - Refresh JWT token

## 🔧 Usage Examples

### Get All Content Blocks

```bash
curl -X GET "http://localhost:8080/api/content?page=1&limit=10&content_type=banner,hero&is_active=true"
```

### Create a Text Block

```bash
curl -X POST "http://localhost:8080/api/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "text",
    "title": "Welcome Message",
    "data": {
      "content": "Welcome to our amazing platform!",
      "text_align": "center",
      "font_size": "large"
    },
    "order": 1,
    "is_active": true
  }'
```

### Create a Banner Block

```bash
curl -X POST "http://localhost:8080/api/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "banner",
    "title": "Hero Banner",
    "data": {
      "image_url": "https://example.com/banner.jpg",
      "alt_text": "Hero banner",
      "button_text": "Learn More",
      "button_link": "https://example.com/learn-more",
      "overlay_text": "Discover Amazing Features"
    },
    "order": 2
  }'
```

### Reorder Content Blocks

```bash
curl -X PATCH "http://localhost:8080/api/content/BLOCK_ID/order" \
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
      {"id": "BLOCK_ID_1", "order": 1},
      {"id": "BLOCK_ID_2", "order": 2},
      {"id": "BLOCK_ID_3", "order": 3}
    ]
  }'
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗 Development

### Project Structure

```
src/
├── controllers/         # Request handlers
├── db/
│   └── models/         # Mongoose models
├── lib/                # Utility functions and helpers
├── middleware/         # Express middleware
├── routes/             # Route definitions
├── services/           # Business logic services
├── types/              # TypeScript type definitions
└── tests/              # Test files
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Build for Production

```bash
npm run build
npm start
```

## 🔒 Security

- JWT-based authentication for admin operations
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- Rate limiting (recommended for production)

## 📊 Monitoring

The API includes comprehensive logging and error handling:

- Request logging with Morgan
- Structured error responses
- Development vs production error details
- Custom error classes for different scenarios

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://your-mongo-host:27017/content-blocks
JWT_SECRET=your-super-secure-production-jwt-secret
API_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_URL=https://your-admin-domain.com
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8080
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the [API Documentation](http://localhost:8080/api/docs)
- Review the test files for usage examples
- Open an issue for bugs or feature requests