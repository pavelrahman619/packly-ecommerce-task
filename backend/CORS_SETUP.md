# CORS Configuration for Furniture E-Commerce Backend

## Overview
Cross-Origin Resource Sharing (CORS) has been properly configured to allow your frontend applications to communicate with the backend API.

## Configuration Details

### Allowed Origins
The CORS configuration dynamically sets allowed origins based on the environment:

**Development Environment:**
- `http://localhost:3000` - Main frontend (Next.js)
- `http://localhost:3001` - Admin panel (if applicable)
- `http://localhost:3002` - Additional development server

**Production Environment:**
- Configured via environment variables `FRONTEND_URL` and `ADMIN_URL`
- Default fallbacks provided in code

### Allowed Methods
- `GET` - Retrieve data
- `POST` - Create new resources
- `PUT` - Update entire resources
- `PATCH` - Partial updates
- `DELETE` - Remove resources
- `OPTIONS` - Preflight requests

### Allowed Headers
- `Origin`
- `X-Requested-With`
- `Content-Type`
- `Accept`
- `Authorization`
- `token`
- `x-access-token`

## Environment Variables

Add these to your `.env` file:

```bash
NODE_ENV=development
FRONTEND_URL=https://your-production-frontend.com
ADMIN_URL=https://your-production-admin.com
```

## Features

1. **Dynamic Origin Validation**: The server validates origins dynamically, allowing requests from configured domains only.

2. **Development Mode**: In development, additional flexibility is provided to ease local development.

3. **Credentials Support**: Cookies and authentication headers are supported across origins.

4. **Preflight Handling**: Proper handling of preflight OPTIONS requests.

5. **Socket.IO CORS**: WebSocket connections also respect the same CORS configuration.

## Testing CORS

To test if CORS is working correctly:

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Start your frontend application on `http://localhost:3000`

3. Try making API calls from your frontend to `http://localhost:8080/api/*`

4. Check browser developer tools for any CORS-related errors.

## Common Issues

1. **"Not allowed by CORS" Error**: Make sure your frontend URL is included in the allowed origins.

2. **Preflight Request Failures**: Ensure your API routes handle OPTIONS requests properly.

3. **Credentials Issues**: Make sure both frontend and backend are configured to handle credentials if using authentication cookies.

## Production Deployment

When deploying to production:

1. Set `NODE_ENV=production`
2. Configure `FRONTEND_URL` and `ADMIN_URL` environment variables
3. Ensure your production domains match the configured URLs

## Security Notes

- The current configuration allows credentials (cookies, auth headers) across origins
- In production, be specific about allowed origins rather than using wildcards
- Regularly review and update allowed origins as your infrastructure changes
