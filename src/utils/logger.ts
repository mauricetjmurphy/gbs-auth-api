import logger from "pino";
import dayjs from "dayjs";

export const log = logger({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
  timstamp: () => `,"time":"${dayjs().format()}"`,
});
