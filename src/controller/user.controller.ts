import { Request, Response } from "express";
import { omit } from "lodash";
import { CreateUserInput } from "../schema/user.schema";
import { createUserService } from "../service/user.service";
import { log as logger } from "../utils/logger";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) {
  logger.info(req.body);
  try {
    const user = await createUserService(req.body);
    return res.send(omit(user, "password", "passwordConfirmation", "salt"));
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send(e.message);
  }
}
