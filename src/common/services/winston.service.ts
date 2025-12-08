import * as winston from 'winston';
import 'winston-daily-rotate-file';
import ConfigKey from '@/common/config/config-key';
import { BooleanString, DateFormat } from '../constants';
const { label, combine, timestamp, printf } = winston.format;

export function createWinstonLogger(className: string) {
    // Console: with color and timestamp
    const upperCaseLevel = winston.format((info) => {
        info.level = info.level.toUpperCase();
        return info;
    });

    const consoleFormat = combine(
        label({ label: className }),
        timestamp(),
        upperCaseLevel(),
        winston.format.colorize({ level: true }),
        printf(({ level, message, timestamp, label }) => {
            return `[${timestamp}] ${level} [${label}]: ${JSON.stringify(message)}`;
        }),
    );

    // File: plain, no color
    const fileFormat = combine(
        label({ label: className }),
        timestamp(),
        upperCaseLevel(),
        printf(({ level, message, timestamp, label }) => {
            return `[${timestamp}] ${level} [${label}]: ${JSON.stringify(message)}`;
        }),
    );

    const transports: winston.transport[] = [
        new winston.transports.Console({
            level: process.env[ConfigKey.LOG_LEVEL],
            format: consoleFormat,
        }),
    ];

    // Only add file transport if LOG_ENABLE_LOG_TO_FILE is TRUE
    if (process.env[ConfigKey.LOG_ENABLE_LOG_TO_FILE] === BooleanString.TRUE) {
        transports.push(
            new winston.transports.DailyRotateFile({
                filename: `${process.env[ConfigKey.LOG_ROOT_FOLDER]}/%DATE%.log`,
                datePattern: DateFormat.YYYY_MM_DD_HYPHEN,
                zippedArchive: true,
                maxSize: process.env[ConfigKey.LOG_MAX_SIZE] + 'm',
                maxFiles: process.env[ConfigKey.LOG_MAX_FILES] + 'd',
                format: fileFormat,
            }),
        );
    }

    const logger = winston.createLogger({
        level: process.env[ConfigKey.LOG_LEVEL],
        transports,
    });

    return logger;
}
