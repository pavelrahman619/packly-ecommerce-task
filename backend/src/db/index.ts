import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/packly-ecommerce";

console.log("🔌 Connecting to MongoDB...");
console.log("MONGODB_URI:", MONGODB_URI);


// Create connection promise for server startup
const connectDB = mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000
  })
  .then(() => {
    console.log("✅ MongoDB Connection Successful");
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
  });

// Export the connection promise for server startup
export const dbConnectionPromise = connectDB;

mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected");
});

export default mongoose;
