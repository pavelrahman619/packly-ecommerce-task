/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "i am a secret key";

export const providerAuthMiddleware = (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // console.log("token=====", token);
    const decoded = jwt.verify(token, JWT_SECRET) as { providerId: string };
    // console.log("Decoded token:", decoded);
    req.user = { providerId: decoded.providerId };
    // console.log(req.user);
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
