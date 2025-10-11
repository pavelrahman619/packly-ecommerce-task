import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/jwt.service";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("token");
    const JWTPayload = verifyToken(token as string) as { userId: string };
    // const JWTPayload = { userId: "674c66d51629c43591abede4" };
    const user_id = JWTPayload.userId;
    req.body.user_id = user_id;
    delete req.body.token;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
