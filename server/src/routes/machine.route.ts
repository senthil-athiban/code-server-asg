import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import machineController from "../controllers/machine.controller";
import { validateMachineRequest } from "../middlewares/request";
import { copyBaseCode } from "../utils/helpers";

const router = Router();

// temp
router.post('/create', async (req, res) => {
    const { projectId, language } = req.body;

    if(!projectId) {
        res.status(400).send({error:'Project id was given'})
        return;
    }

    try {
        await copyBaseCode(`base/${language}/`, `user-code/${projectId}/`);
    } catch (error) {
        
    }

    res.status(200).send({message: 'Project created'});
    
})

// old
router.post('/', authMiddleware, machineController.create);
router.get('/', authMiddleware, machineController.listMachine);
router.get('/:machineId/connect', authMiddleware, validateMachineRequest, machineController.connect);
router.post('/:machineId/reconnect', authMiddleware, validateMachineRequest,  machineController.reconnect);
router.post('/:machineId/terminate', authMiddleware, validateMachineRequest, machineController.terminate);
router.post('/:machineId/ping', authMiddleware, validateMachineRequest, machineController.ping);

export const machineRouter = router;