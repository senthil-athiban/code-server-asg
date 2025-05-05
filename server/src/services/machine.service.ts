import ApiError from "../config/error";
import { machineState, machineStatus } from "../config/machine";
import { Machine } from "../model/machine.model";
import awsService from "./aws.service";

const findMachineById = async (id: string) => await Machine.findById(id);

const findMachineByUser = async (machineId: string, userId: string) =>
  await Machine.findOne({ _id: machineId, user: userId });

const cleanupInactiveMachines = async () => {
  const fiveMinutesAgo = new Date(Date.now() - 1 * 60 * 1000);
  const machines = await Machine.find({
    status: machineStatus.ACTIVE,
    state: { $ne: machineState.DISCONNECTED },
    lastActiveAt: { $lt: fiveMinutesAgo },
  });

  // TODO: run aws service to terminate the machines by bactch wise
  
  // after successfull termination, update the machines status to be inActive and state to be disconnected
  const command = machines.map((machine) => ({
    updateOne: {
      filter: { _id: machine.id },
      update: {
        $set: {
          status: machineStatus.IN_ACTIVE,
          state: machineState.DISCONNECTED,
        },
      },
    },
  }));
  const result = await Machine.bulkWrite(command);
  console.log(
    `Updated ${result.modifiedCount} machines to inactive status and disconnected`
  );
  return result;
};

const createMachine = async (userId: string) => {
  try {
    const awsInstance = await awsService.createInstance();

    const machine = await new Machine({
      instanceId: awsInstance?.instanceId,
      ipAddress: awsInstance?.ipAddress,
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

const verifyExpiration = (lastActiveAt: NativeDate): Boolean => {
  const lastActivedAt = new Date(lastActiveAt).getTime();
  const currDate = new Date().getTime();
  const maxInactiveTime = 5 * 60 * 1000; // 5 mins
  const timeDifference = currDate - lastActivedAt;
  return timeDifference > maxInactiveTime;
};

const validateBeforeConnect = async (userId: string, machineId: string) => {
  try {
    const machine = await findMachineByUser(machineId, userId);
    if (!machine) {
      throw new ApiError(
        404,
        "No machine was found with given Instance ID for the corresponding user"
      );
    }

    if (machine.status === machineStatus.IN_ACTIVE) {
      throw new ApiError(
        403,
        "The machine has been terminated. Please create new machine"
      );
    }

    const isExpired = verifyExpiration(machine.lastActiveAt);

    if (isExpired) {
      throw new ApiError(
        404,
        "Your machine has been disconnected, since you have been went offline for long time"
      );
    }

    const updatedMachine = await Machine.findOneAndUpdate(
      {
        _id: machineId,
        user: userId,
        status: machineStatus.ACTIVE,
      },
      {
        lastActiveAt: new Date(),
        state: machineState.CONNNECTED,
      },
      { new: true }
    );

    if (!updatedMachine) {
      throw new ApiError(
        500,
        "Failed to connect to the machine. Please try again"
      );
    }

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

    // TODO: add aws service to terminate the machine

    await Machine.findOneAndUpdate(
      {
        _id: machineId,
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

const pingMachine = async (userId: string, machineId: string) => {
  try {
    const updatedMachine = await Machine.findOneAndUpdate(
      { _id: machineId, user: userId, status: machineStatus.ACTIVE },
      { lastActiveAt: new Date(), state: machineState.CONNNECTED },
      { new: true }
    );

    if (!updatedMachine) {
      const machine = await Machine.findOne({ _id: machineId, user: userId });
      if (machine?.status === machineStatus.IN_ACTIVE) {
        throw new ApiError(
          403,
          "The machine has been terminated. Please create new machine"
        );
      } else {
        throw new ApiError(
          404,
          "No active machine was found. Please create a new machine."
        );
      }
    }

    return updatedMachine;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to refresh connection");
  }
};

const findMachinesByUser = async (userId: string) => {
  try {
    const machines = await Machine.find({ user: userId }).sort({
      createdAt: -1, // (newest first)
      status: 1, // (active first)
    });

    return machines;
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve machines");
  }
};

export default {
  createMachine,
  validateBeforeConnect,
  terminateMachine,
  findMachineByUser,
  pingMachine,
  findMachinesByUser,
  findMachineById,
  cleanupInactiveMachines,
};
