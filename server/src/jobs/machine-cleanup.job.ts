import cron from "node-cron";
import machineService from "../services/machine.service";

export const registerMachineCleanupJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running machine cleanup job");
      await machineService.cleanupInactiveMachines();
    } catch (error) {
      console.log("Error in running machine cleanup jobs:", error);
    }
  });
};
