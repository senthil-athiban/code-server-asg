import { v4 as uuidv4 } from "uuid";

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