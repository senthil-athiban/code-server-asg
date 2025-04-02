import { v4 as uuidv4 } from "uuid";

import {
  AutoScalingClient,
  DetachInstancesCommand,
} from "@aws-sdk/client-auto-scaling";
import { EC2Client, TerminateInstancesCommand } from "@aws-sdk/client-ec2";
import { awsConfig } from "../config/config";
import { Machine } from "../model/machine.model";
import machineState, { machineStatus } from "../config/machine";
import ApiError from "../config/error";

const awsCredentials = {
  accessKeyId: awsConfig.accessKey,
  secretAccessKey: awsConfig.secretKey,
};

export const asgClient = new AutoScalingClient({
  region: awsConfig.region,
  credentials: awsCredentials,
});

export const ec2Client = new EC2Client({
  region: awsConfig.region,
  credentials: awsCredentials,
});

const createInstance = async () => {
  const idleMachines = await Machine.find({
    state: machineState.READY_TO_CONNECT,
    status: machineStatus.ACTIVE,
  });

  if (idleMachines.length === 0) {
    throw new ApiError(
      503,
      "No machines available currently, please try again later"
    );
  }

  const newMachine = idleMachines.at(0);

  if (!newMachine) return;
  const machine = await Machine.findOneAndUpdate(
    { instanceId: newMachine.instanceId },
    {
      state: machineState.CONNNECTED,
      status: machineStatus.ACTIVE,
    }
  );

  // await adjustCapacity();
  return {
    instanceId: machine?.instanceId,
    ipAddress: machine?.ipAddress,
    launchTime: new Date(),
  };
};

// fetch machine by instance id
const getMachine = () => {};

const terminateMachine = async (instanceId: string) => {
  if (!instanceId) {
    throw new ApiError(400, "Instance ID is missing");
  }

  try {
    const detachCommand = new DetachInstancesCommand({
      AutoScalingGroupName: awsConfig.asgGroupName,
      InstanceIds: [instanceId],
      ShouldDecrementDesiredCapacity: true,
    });

    await asgClient.send(detachCommand);

    const terminateCommand = new TerminateInstancesCommand({
      InstanceIds: [instanceId],
    });

    await ec2Client.send(terminateCommand);
    await Machine.findOneAndUpdate(
      { instanceId: instanceId },
      { state: machineState.DISCONNECTED, status: machineStatus.IN_ACTIVE }
    );

    console.log(`Machine released: ${instanceId}`);
    // await refreshMachineState();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "failed to terminate machine");
  }
};

export default {
  createInstance,
  getMachine,
  terminateMachine,
};
