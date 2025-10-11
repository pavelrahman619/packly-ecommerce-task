import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwtPayload";
const secretKey = process.env.JWT_SECRET || "i am a secret key";

export const createToken = (userId: string) => {
  return jwt.sign({ userId: userId }, secretKey);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, secretKey) as JwtPayload;
};
