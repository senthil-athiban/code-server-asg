import type { Request, Response } from "express";
import { asyncMiddleware } from "../middlewares/asyncHandler";
import userService from "../services/user.service";
import ApiError from "../config/error";

const getProfile = asyncMiddleware(async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const user = await userService.getUserById(userId);
        if(!user) {
            throw new ApiError(404, 'No user was found');
        }
        const { password, ...userWithoutPassword } = user.toObject();
        res.status(200).send({ user: userWithoutPassword });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
          }
    }
});

export default {
    getProfile
}