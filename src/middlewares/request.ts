import type { NextFunction, Request, Response } from "express";
import { asyncMiddleware } from "./asyncHandler";
import ApiError from "../config/error";

const validateMachineRequest = asyncMiddleware(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const machineId = req.params.machineId;

    if(!userId) {
        throw new ApiError(401, 'User not authenticated');
    }

    if(!machineId) {
        throw new ApiError(400, 'Machine ID was not provided');
    }

    next();
})

export { validateMachineRequest }