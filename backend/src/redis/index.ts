import Redis from "ioredis";
// import { Redis } from "@upstash/redis";
// export const redis = new Redis({
//   port: 6379,
//   host: "http://clever-elephant-41860.upstash.io",
//   connectTimeout: 10000,
// });

//Shongi app upstash API Key - 2d9b5bcd-a828-4704-a19d-e73b4eef76a4

// Use environment variable for Redis connection
// Falls back to a default connection string for development
const REDIS_URL = process.env.REDIS_URL || 
  "rediss://default:AXAhAAIjcDE5YzI0NWMxYWRmZGI0ZmQzYmFhZjAxMTRjNjM0OWVhYnAxMA@active-yak-28705.upstash.io:6379";

export const redis = new Redis(REDIS_URL);

// export const redis = new Redis({
//   url: "https://us1-proxy.upstash.io",
//   token: "2d9b5bcd-a828-4704-a19d-e73b4eef76a4",
// });
