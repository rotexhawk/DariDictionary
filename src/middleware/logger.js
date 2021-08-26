import path from "path";
const winston = require("winston");
const expressWinston = require("express-winston");

export function logger() {
  return expressWinston.logger({
    transports: [
      new winston.transports.File({
        level: "debug",
        filename: path.resolve(__dirname, "..", "..", "logs/all-logs.log"),
        handleExceptions: true,
        json: false,
        timestamp: true,
        maxsize: 5242880, //5MB
        maxFiles: 5,
        colorize: true,
        prettyPrint: true,
        meta: false,
      }),
    ],
  });
}

export function errorLogger() {
  return expressWinston.errorLogger({
    transports: [
      new winston.transports.File({
        filename: path.resolve(__dirname, "..", "..", "logs/error-logs.log"),
        handleExceptions: true,
        json: false,
        timestamp: true,
        maxsize: 5242880, //5MB
        maxFiles: 5,
        colorize: true,
        prettyPrint: true,
        meta: false,
        process: false,
        humanReadableUnhandledException: true,
      }),
    ],
  });
}
