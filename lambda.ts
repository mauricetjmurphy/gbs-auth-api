import app from "./src/app";
import config from "config";
import { log as logger } from "./src/utils/logger";

// import serverless from "serverless-http";

// export const handler = serverless(app);

const port = config.get<number>("port");

app.listen(port, () => {
  logger.info(`App listening at http://localhost:${port}`);
});
