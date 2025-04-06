import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import machineController from "../controllers/machine.controller";
import { validateMachineRequest } from "../middlewares/request";

const router = Router();

router.post('/', authMiddleware, machineController.create);
router.get('/', authMiddleware, machineController.listMachine);
router.get('/:machineId/connect', authMiddleware, validateMachineRequest, machineController.connect);
router.post('/:machineId/reconnect', authMiddleware, validateMachineRequest,  machineController.reconnect);
router.post('/:machineId/terminate', authMiddleware, validateMachineRequest, machineController.terminate);
router.post('/:machineId/ping', authMiddleware, validateMachineRequest, machineController.ping);

export const machineRouter = router;