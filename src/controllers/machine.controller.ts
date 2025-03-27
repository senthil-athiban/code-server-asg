import type { Request, Response } from "express";
import { asyncMiddleware } from "../middlewares/asyncHandler";
import ApiError from "../config/error";
import machineService from "../services/machine.service";

const create = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new ApiError(404, "User ID was not provided");
  const machine = await machineService.createMachine(userId);
  res.status(201).send(machine);
});

const connect = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req.userId;
  const machineId = req.params.machineId;

  const machine = await machineService.findMachineByUser(machineId, userId);
  if (!machine)
    throw new ApiError(404, "No machine was found with given Instance ID");
  res.status(200).send(machine);
});

const reconnect = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req.userId;
  const machineId = req.params.machineId;

  const machine = await machineService.validateBeforeConnect(userId, machineId);

  res.status(200).send(machine);
});

const terminate = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req.userId;
  const machineId = req.params.machineId;

  await machineService.terminateMachine(userId, machineId);

  res.status(200).send({ message: "Machine has been terminated" });
});

const ping = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req.userId;
  const machineId = req.params.machineId;

  await machineService.pingMachine(userId, machineId);
  res.status(200).send({ message: "Connection refreshed" });
});

const listMachine = asyncMiddleware(async (req: Request, res: Response) => {
  const userId = req.userId;

  const machines = await machineService.findMachinesByUser(userId);
  res.status(200).send(machines);
});

export default { connect, create, reconnect, terminate, ping, listMachine };
