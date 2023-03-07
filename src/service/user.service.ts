import { createUser, User, UserInput } from "../models/user.model";
import { log as logger } from "../utils/logger";

export async function createUserService(input: UserInput) {
  logger.info(input);

  try {
    return await createUser(input);
  } catch (e: any) {
    throw new Error(e);
  }
}
