import { v4 as uuidv4 } from "uuid";

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
import { awsConfig } from "./config";

const AWS_REGION = "ap-south-1";

const awsCredentials = {
  accessKeyId: awsConfig.accessKey,
  secretAccessKey: awsConfig.secretKey,
};

export const asgClient = new AutoScalingClient({
  region: AWS_REGION,
  credentials: awsCredentials,
});

export const ec2Client = new EC2Client({
  region: AWS_REGION,
  credentials: awsCredentials,
});


export const ASG_CONFIG = {
  groupName: awsConfig.asgGroupName,
  idealPoolSize: 5,
};

// create machine and assign ip to user
const createInstance = async () => {
  // mocking the machine details
  const instanceId = `i-${uuidv4().substring(0, 8)}`;
  const ipAddress = `${Math.floor(Math.random() * 256)}.${Math.floor(
    Math.random() * 256
  )}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

  return {
    instanceId,
    ipAddress,
    launchTime: new Date(),
  };
};

// fetch machine by instance id
const getMachine = () => {};

// stop the machine
const terminateMachine = () => {};


export default { 
    createInstance,
    getMachine,
    terminateMachine
}