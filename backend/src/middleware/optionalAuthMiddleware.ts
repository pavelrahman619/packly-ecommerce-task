import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/jwt.service";

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("token");

    if (token) {
      try {
        const JWTPayload = verifyToken(token as string) as { userId: string };
        const user_id = JWTPayload.userId;
        req.body.user_id = user_id;
      } catch (tokenError) {
        console.log(
          "Invalid token provided, proceeding without authentication:",
          tokenError,
        );
        req.body.user_id = null;
      }
    } else {
      req.body.user_id = null;
    }

    delete req.body.token;
    next();
  } catch (error) {
    console.log("Error in optionalAuthMiddleware:", error);
    req.body.user_id = null;
    delete req.body.token;
    next();
  }
};
