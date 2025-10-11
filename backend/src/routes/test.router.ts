import { Router } from "express";
import { Request, Response } from "express";

const router = Router();

// Basic health check
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Backend server is running successfully",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 8080
  });
});

// Database connection test (if you have database setup)
router.get("/db", async (req: Request, res: Response) => {
  try {
    // Note: Replace this with actual database connection test
    // For example, if using MongoDB: await mongoose.connection.db.admin().ping();
    // For now, just checking if DB_URL exists
    const dbConnected = !!process.env.DATABASE_URL || !!process.env.DB_URL || !!process.env.MONGODB_URI;
    
    res.status(200).json({
      status: dbConnected ? "OK" : "WARNING",
      message: dbConnected ? "Database configuration found" : "No database configuration detected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

// Environment variables check
router.get("/env", (req: Request, res: Response) => {
  const requiredEnvVars = [
    "NODE_ENV",
    "PORT",
    "JWT_SECRET",
    "DATABASE_URL"
  ];

  const envStatus = requiredEnvVars.map(envVar => ({
    name: envVar,
    exists: !!process.env[envVar],
    value: envVar === "JWT_SECRET" ? (process.env[envVar] ? "[HIDDEN]" : undefined) : process.env[envVar]
  }));

  const allPresent = envStatus.every(env => env.exists);

  res.status(allPresent ? 200 : 206).json({
    status: allPresent ? "OK" : "PARTIAL",
    message: allPresent ? "All required environment variables are set" : "Some environment variables are missing",
    environment: envStatus,
    timestamp: new Date().toISOString()
  });
});

// API endpoints test
router.get("/routes", (req: Request, res: Response) => {
  const availableRoutes = [
    { path: "/api/auth", description: "Authentication routes" },
    { path: "/api/users", description: "User management routes" },
    { path: "/api/products", description: "Product management routes" },
    { path: "/api/categories", description: "Category management routes" },
    { path: "/api/cart", description: "Shopping cart routes" },
    { path: "/api/orders", description: "Order management routes" },
    { path: "/api/payment", description: "Payment processing routes" },
    { path: "/api/delivery", description: "Delivery management routes" },
    { path: "/api/admin", description: "Admin panel routes" },
    { path: "/api/upload", description: "File upload routes" },
    { path: "/api/content", description: "Content management routes" },
    { path: "/api/test", description: "Test and health check routes" }
  ];

  res.status(200).json({
    status: "OK",
    message: "Available API routes",
    routes: availableRoutes,
    totalRoutes: availableRoutes.length,
    timestamp: new Date().toISOString()
  });
});

// Complete system status
router.get("/status", (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: "OK",
    message: "Furniture E-commerce Backend Status",
    server: {
      uptime: `${Math.floor(uptime / 60)} minutes ${Math.floor(uptime % 60)} seconds`,
      environment: process.env.NODE_ENV || "development",
      port: process.env.PORT || 8080,
      nodeVersion: process.version
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
    },
    timestamp: new Date().toISOString()
  });
});

// Error simulation for testing error handling
router.get("/simulate-error", (req: Request, res: Response) => {
  throw new Error("This is a simulated error for testing purposes");
});

export default router;
