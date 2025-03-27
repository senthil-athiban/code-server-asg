import { Types } from "mongoose";
import ApiError from "../config/error";
import machineState, { machineStatus } from "../config/machine";
import { Machine } from "../model/machine.model";
import awsService from "./aws.service";

const findMachineById = async (id: string) => await Machine.findById(id);

const findMachineByUser = async (machineId: string, userId: string) =>
  await Machine.findOne({ _id: machineId, user: userId });

const createMachine = async (userId: string) => {
  try {
    // 1. Create actual AWS instance via AWS service
    const awsInstance = await awsService.createInstance();

    // 2. Store machine metadata in our database
    const machine = await new Machine({
      instanceId: awsInstance.instanceId,
      ipAddress: awsInstance.ipAddress,
      state: machineState.READY_TO_CONNECT,
      user: userId,
      status: machineStatus.ACTIVE,
      lastActiveAt: new Date(),
    }).save();

    return {
      machineId: machine._id,
      instanceId: machine.instanceId,
      ipAddress: machine.ipAddress,
      state: machine.state,
      status: machine.status,
    };
  } catch (error) {
    console.error("Failed to create machine:", error);
    throw error;
  }
};

const validateBeforeConnect = async (userId: string, machineId: string) => {
  try {
    const machine = await findMachineByUser(machineId, userId);
    if (!machine)
      throw new ApiError(
        404,
        "No machine was found with given Instance ID for the corresponding user"
      );

    const lastActivedAt = new Date(machine.lastActiveAt).getTime();
    const currDate = new Date().getTime();
    const maxInactiveTime = 5 * 60 * 1000; // 5 mins
    const timeDifference = currDate - lastActivedAt;
    const isExpired = timeDifference > maxInactiveTime;

    if (isExpired) {
      throw new ApiError(
        404,
        "Your machine has been disconnected, since you have been went offline for long time"
      );
    }

    const updatedMachine = await Machine.findOneAndUpdate(
      {
        id: machineId,
        user: userId,
      },
      {
        lastActiveAt: new Date(),
      },
      { new: true }
    );

    return updatedMachine;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
  }
};

const terminateMachine = async (userId: string, machineId: string) => {
  try {
    const machine = await findMachineByUser(machineId, userId);
    if (!machine)
      throw new ApiError(
        404,
        "No machine was found with given Instance ID for the corresponding user"
      );

    await Machine.findOneAndUpdate(
      {
        id: machineId,
        user: userId,
      },
      {
        state: machineState.DISCONNECTED,
        status: machineStatus.IN_ACTIVE,
        lastActiveAt: new Date(),
      },
      {
        new: true,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to terminate machine");
  }
};

export default {
  createMachine,
  validateBeforeConnect,
  terminateMachine,
};
