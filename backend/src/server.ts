import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import contentRoutes from "./routes/content.router";
import testRoutes from "./routes/test.router";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { errorHandler } from "./middleware/erroHandler";
import cors from "cors";
import { Request, Response, NextFunction } from "express";

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

// Development URLs
const DEV_FRONTEND_URL = "http://localhost:3000";
const DEV_ADMIN_URL = "http://localhost:3001";

// Production URLs (update these with your actual production domains)
const PROD_FRONTEND_URL = process.env.FRONTEND_URL || "https://staging-release--splendorous-centaur-b5e5f1.netlify.app";
const PROD_ADMIN_URL = process.env.ADMIN_URL || "https://staging-release--splendorous-centaur-b5e5f1.netlify.app";

// Netlify site configuration
const NETLIFY_SITE_ID = "splendorous-centaur-b5e5f1";

// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === "production" 
  ? [
      PROD_FRONTEND_URL, 
      PROD_ADMIN_URL,
      // Allow all branch deployments from Netlify site
      new RegExp(`^https://.*--${NETLIFY_SITE_ID}\\.netlify\\.app$`),
      // Allow main Netlify domain
      `https://${NETLIFY_SITE_ID}.netlify.app`,
      // Add custom domain if you have one
      process.env.CUSTOM_DOMAIN
    ].filter(Boolean) // Remove undefined values
  : [DEV_FRONTEND_URL, DEV_ADMIN_URL, "http://localhost:3002"];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origins (including regex patterns)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed || process.env.NODE_ENV === "development") {
      console.log(`✅ CORS allowed origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With", 
    "Content-Type", 
    "Accept", 
    "Authorization",
    "token",
    "x-access-token"
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dynamic Content Blocks API',
      version: '1.0.0',
      description: 'A flexible content management API for dynamic content blocks',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.API_URL || 'https://your-api-domain.com'
          : `http://localhost:${port}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.set("origins", allowedOrigins);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get("/", (req, res) => {
  res.send("Dynamic Content Blocks API v1.0.0 - Server is running!");
});

// API Routes
app.use("/api/content", contentRoutes);
app.use("/api/test", testRoutes);

app.get("/test-error", (req: Request, res: Response, next: NextFunction) => {
  try {
    throw new Error("Simulated error from test route");
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

// Global error middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log("GLOBAL ERROR MIDDLEWARE TRIGGERED");
  console.error(err);
  if (!res.headersSent) {
    res.status(err.statusCode || err.status || 500).json({
      message: err.message || 'Internal Server Error',
      errors: err.errors || undefined,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  } else {
    next(err);
  }
});

app.listen(port, async () => {
  console.warn(`🚀 Dynamic Content Blocks API running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log('🌐 Allowed CORS Origins:');
  allowedOrigins.forEach((origin, index) => {
    if (typeof origin === 'string') {
      console.log(`  ${index + 1}. ${origin}`);
    } else if (origin instanceof RegExp) {
      console.log(`  ${index + 1}. ${origin.toString()} (regex pattern)`);
    }
  });
});
