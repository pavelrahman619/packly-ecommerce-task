# Environment Variables Setup

This document explains how to set up environment variables for the Furniture E-commerce Backend.

## Quick Start

1. Copy the environment template:
   ```bash
   cp src/.env.example src/.env
   ```

2. Edit `src/.env` with your actual values:
   ```bash
   nano src/.env  # or use your preferred editor
   ```

3. Update the following critical variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USER` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `DB_NAME` | Database name | `furniture_ecom` |
| `DB_HOST` | Database host | `localhost` |
| `JWT_SECRET` | JWT signing secret | `your_super_secret_key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `ADMIN_URL` | Admin panel URL for CORS | `http://localhost:3001` |

### SMS Configuration (Optional)

If you want SMS functionality:
- `SMSAPI` - SMS service endpoint
- `ADN_API_KEY` - ADN SMS API key
- `ADN_API_SECRET` - ADN SMS API secret

### Payment Gateway (Optional)

Uncomment and configure payment gateway variables as needed:
- Stripe: `STRIPE_SECRET_KEY`
- PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate secrets regularly in production
- Use environment-specific `.env` files for different deployment stages

## Local Development

For local development, you can use `.env.local` as a template with development-friendly defaults.

## Production Setup

For production deployment:
1. Set `NODE_ENV=production`
2. Use secure database credentials
3. Generate a strong JWT secret (minimum 32 characters)
4. Configure proper CORS origins
5. Set up proper logging level (`info` or `warn`)
