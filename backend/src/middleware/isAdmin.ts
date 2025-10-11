import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const checkAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized. Token is missing." });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };

    if (decoded.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }

    next();
  } catch (error) {
    console.error("Error in checkAdmin middleware:", error);
    res.status(403).json({ message: "Invalid or expired token." });
  }
};
