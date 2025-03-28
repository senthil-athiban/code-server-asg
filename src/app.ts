import express from "express";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/user.route";
import connectDb from "./db/connect";
import errorHanlder from "./middlewares/error";
import { machineRouter } from "./routes/machine.router";
import morgan from "morgan";
import cron from "node-cron";
import {
  AutoScalingClient,
  DescribeAutoScalingGroupsCommand,
  DetachInstancesCommand,
  SetDesiredCapacityCommand,
  TerminateInstanceInAutoScalingGroupCommand,
  UpdateAutoScalingGroupCommand,
} from "@aws-sdk/client-auto-scaling";
import { EC2Client, DescribeInstancesCommand, TerminateInstancesCommand } from "@aws-sdk/client-ec2";
import { awsConfig } from "./config/config";
import { registerCronJobs } from "./jobs";

const app = express();
app.use(morgan("dev"));

app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/machine", machineRouter);

const IDEAL_POOL_SIZE = 5;

const asgClient = new AutoScalingClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: awsConfig.accessKey,
    secretAccessKey: awsConfig.secretKey,
  },
});

const ec2Client = new EC2Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: awsConfig.accessKey,
    secretAccessKey: awsConfig.secretKey,
  },
});

let idleMachines: any[] = [];
let activeMachines = 0;
let totalMachines = 0;

app.get("/get/machine", async (req, res) => {
  if (idleMachines.length === 0) {
    res.status(503).json({
      error: "No machines available currently, please try again later",
    });
  }

  const machine = idleMachines.pop();

  activeMachines++;

  await adjustCapacity();

  res.status(200).send(machine);
});

app.post("/delete/machine/:machineId", async (req, res) => {
  const instanceId = req.params.machineId;

  if (!instanceId) {
    res.status(400).send({ error: "Instance ID is missing" });
    return;
  }

  const detachCommand = new DetachInstancesCommand({
    AutoScalingGroupName: awsConfig.asgGroupName,
    InstanceIds: [instanceId],
    ShouldDecrementDesiredCapacity: true
  });
  await asgClient.send(detachCommand);

//   const terminateCommand = new TerminateInstanceInAutoScalingGroupCommand({})

  const terminateCommand = new TerminateInstancesCommand({
    InstanceIds: [instanceId]
  });

  await ec2Client.send(terminateCommand);

  
  activeMachines--;

  console.log(`Machine released: ${instanceId}`);

  await refreshMachineState();

  res.status(200).json({ success: true });
});
app.use(errorHanlder);

const adjustCapacity = async () => {
  const idealCapacity = activeMachines + IDEAL_POOL_SIZE; // or ( activeMachines + idleMachines + (POOL_SIZE - idleMachines))

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
      idleMachines = [];
      totalMachines = 0;
      return;
    }

    totalMachines = instanceIds.length;

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

    idleMachines = instanceDetails.slice(0, totalMachines - activeMachines);

    console.log(
      `Total: ${totalMachines}, Active: ${activeMachines}, Idle: ${idleMachines.length}`
    );

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
app.listen(8080, async () => {
  console.log("server started on PORT 3000");
  await connectDb();
  registerCronJobs();
  await initialSetup();
});
