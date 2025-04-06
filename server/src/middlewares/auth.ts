import type { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken";
import { JWT_SECRET } from "../config/config";
import ApiError from "../config/error";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headers = req.headers.authorization;
    const token = headers?.split(" ").at(1);
    if (!token) {
        return next(new ApiError(401, "Authentication token is missing"));
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.sub as string;
    req.userId = userId;
    next();
    
} catch (error: any) {
    if (error instanceof TokenExpiredError) {
      return next(new ApiError(401, "Authentication token has expired"));
    } 
    else if (error instanceof NotBeforeError) {
      return next(new ApiError(401, "Token not yet valid"));
    }
    else if (error instanceof JsonWebTokenError) {
      return next(new ApiError(401, "Invalid authentication token"));
    }
    
    return next(new ApiError(500, "Authentication error"));
  }
};

export default authMiddleware;