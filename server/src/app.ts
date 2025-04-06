import express from "express";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/user.route";
import connectDb from "./db/connect";
import errorHanlder from "./middlewares/error";
import { machineRouter } from "./routes/machine.route";
import morgan from "morgan";
import {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
  DetachInstancesCommand,
  SetDesiredCapacityCommand,
  UpdateAutoScalingGroupCommand,
} from "@aws-sdk/client-auto-scaling";
import {
  EC2Client,
  DescribeInstancesCommand,
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";
import { awsConfig, PORT } from "./config/config";
import { registerCronJobs } from "./jobs";
import { Machine } from "./model/machine.model";
import machineState, { machineStatus } from "./config/machine";
import ApiError from "./config/error";
import { asgClient, ec2Client } from "./services/aws.service";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer()
const io = new Server(httpServer, {});

io.on("connection", (socket) => {
  
});

io.listen(3000);


app.use(morgan("dev"));

app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/machine", machineRouter);

const IDEAL_POOL_SIZE = 5;


app.use(errorHanlder);

const adjustCapacity = async () => {
  const activeMachines = await Machine.countDocuments({
    status: machineStatus.ACTIVE,
    state: machineState.CONNNECTED,
  });
  const totalMachines = await Machine.countDocuments({
    status: machineStatus.ACTIVE,
  });
  const idealCapacity = activeMachines + IDEAL_POOL_SIZE;

  // if expected cap size is same as total machine size, then return it, no need of scaling.
  if (idealCapacity === totalMachines) return;

  try {
    const increaseCommand = new UpdateAutoScalingGroupCommand({
      AutoScalingGroupName: awsConfig.asgGroupName,
      DesiredCapacity: idealCapacity,
    });

    await asgClient.send(increaseCommand);

    console.log(
      `Auto Scaling Group desired capacity updated to ${idealCapacity}`
    );
  } catch (error) {
    console.log("failed to scale ASG:", error);
  }
};

const refreshMachineState = async () => {
  const command = new DescribeAutoScalingGroupsCommand({
    AutoScalingGroupNames: [awsConfig.asgGroupName],
  });

  try {
    const data = await asgClient.send(command);
    if (!data || !data.AutoScalingGroups) return;

    const instances = data.AutoScalingGroups[0].Instances!;
    const instanceIds = instances
      ?.flatMap((instance) => instance.InstanceId!)
      .filter((i) => i && i?.length > 0);

    if (!instanceIds || instanceIds.length === 0) {
      return;
    }

    const ec2Command = new DescribeInstancesCommand({
      InstanceIds: instanceIds,
    });

    const ec2Data = await ec2Client.send(ec2Command);
    if (!ec2Data || !ec2Data.Reservations) {
      console.log("No EC2 data returned");
      return;
    }

    // Extract IP addresses from the EC2 response
    const instanceDetails = ec2Data.Reservations.flatMap(
      (reservation) => reservation.Instances || []
    ).map((instance) => ({
      InstanceId: instance.InstanceId,
      PrivateIpAddress: instance.PrivateIpAddress,
      PublicIpAddress: instance.PublicIpAddress,
      InstanceState: instance.State?.Name,
    }));

    const bulkCommand = instanceDetails.map((machine) => ({
      updateOne: {
        filter: {
          instanceId: machine.InstanceId,
        },
        update: {
          $set: {
            lastActiveAt: new Date(),
            instanceId: machine.InstanceId,
            ipAddress: machine.PublicIpAddress,
          },
          $setOnInsert: {
            state: machineState.READY_TO_CONNECT,
            status: machineStatus.ACTIVE,
            createdAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    if (bulkCommand.length > 0) {
      await Machine.bulkWrite(bulkCommand);
    }

    // set the disconnected machines to be in idle state
    const existingMachines = await Machine.find({
      status: machineStatus.ACTIVE,
    });
    const existingInstanceIds = existingMachines.map((m) => m.instanceId);
    const nonExistentInstanceIds = existingInstanceIds.filter(
      (id) => !instanceIds.includes(id)
    );

    if (nonExistentInstanceIds.length > 0) {
      await Machine.updateMany(
        { instanceId: { $in: nonExistentInstanceIds } },
        {
          state: machineState.DISCONNECTED,
          status: machineStatus.IN_ACTIVE,
          lastUpdated: new Date(),
        }
      );
      console.log(
        `Marked ${nonExistentInstanceIds.length} machines as disconnected`
      );
    }

    await adjustCapacity();
  } catch (error) {
    console.log("failed to process:", error);
  }
};

const initialSetup = async () => {
  try {
    const setCapCommand = new SetDesiredCapacityCommand({
      AutoScalingGroupName: awsConfig.asgGroupName,
      DesiredCapacity: IDEAL_POOL_SIZE,
    });

    await asgClient.send(setCapCommand);

    await refreshMachineState();
  } catch (error) {
    console.log("failed to setup aws:", error);
  }
};

httpServer.listen(PORT, async () => {
  console.log(`server started on PORT ${PORT}`);
  await connectDb();
  registerCronJobs();
  // await initialSetup();
});
