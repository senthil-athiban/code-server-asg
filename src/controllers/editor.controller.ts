import type { Request, Response } from "express";
import { asyncMiddleware } from "../middlewares/asyncHandler";
import awsService from "../services/aws.service";
import ApiError from "../config/error";
import machineService from "../services/machine.service";
import { Machine } from "../model/machine.model";

const create = asyncMiddleware(async (req: Request, res: Response) => {
    const userId = req.userId;
    if(!userId) throw new ApiError(404, 'User ID was not provided');
    const machine = await machineService.createMachine(userId);
    res.status(200).send(machine);
})


const connect = asyncMiddleware(async (req: Request, res: Response) => {
    const userId = req.userId;
    const machineId = req.params.editorId;
    if(!userId || !machineId ) throw new ApiError(400, 'Machine ID or user ID was not provided');
    
    const machine = await Machine.findOne({_id: machineId, user: userId});
    if(!machine) throw new ApiError(404, 'No machine was found with given Instance ID');
    res.status(200).send(machine);
});

const reconnect = asyncMiddleware(async (req: Request, res: Response) => {
    const userId = req.userId;
    const machineId = req.params.editorId;
    if(!userId || !machineId ) throw new ApiError(400, 'Machine ID or user ID was not provided');
    
    const machine = await machineService.validateBeforeConnect(userId, machineId);
    
    res.status(200).send(machine);
});

const terminate = asyncMiddleware(async (req: Request, res: Response) => {
    const userId = req.userId;
    const machineId = req.params.editorId;
    if(!userId || !machineId ) throw new ApiError(400, 'Machine ID or user ID was not provided');
    
    const machine = await machineService.terminateMachine(userId, machineId);
    
    res.status(200).send(machine);
});

export default { connect, create, reconnect }