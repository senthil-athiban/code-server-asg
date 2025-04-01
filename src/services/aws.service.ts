import { v4 as uuidv4 } from "uuid";

import { 
  AutoScalingClient,
} from "@aws-sdk/client-auto-scaling";
import {
  EC2Client,
} from "@aws-sdk/client-ec2";
import { awsConfig } from "../config/config";

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