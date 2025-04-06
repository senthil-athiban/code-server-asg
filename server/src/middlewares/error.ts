import type { NextFunction, Request, Response } from "express";
import ApiError from "../config/error";

const errorHanlder = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
      }
      
    if(err instanceof ApiError){
        res.status(err.status).send({status: err.status, error: err.message, success: err.success});
        return;
    }
    res.status(500).send({status: 500, error: err.message || "Internal Server Error", success: false});
}

export default errorHanlder;