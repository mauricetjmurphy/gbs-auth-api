import express, { Request, Response } from "express";
import { createUserHandler } from "../controller/user.controller";
import validate from "../middleware/validateResourse";
import { createUserSchema, getUserSchema } from "../schema/user.schema";

const router = express.Router();

router.use("/health", (req: Request, res: Response) => res.sendStatus(200));
router.use("/api/users", validate(createUserSchema), createUserHandler);
router.use("/api/user", validate(getUserSchema), createUserHandler);

export default router;
