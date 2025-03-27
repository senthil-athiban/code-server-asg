import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import editorController from "../controllers/editor.controller";

const router = Router();

router.get('/create', authMiddleware, editorController.create);
router.get('/:editorId/connect', authMiddleware, editorController.connect);
// reconnecting to single editor
router.get('/:editorId/reconnect', authMiddleware, editorController.reconnect)

export const editorRouter = router;