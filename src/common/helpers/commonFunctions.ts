import bcrypt from 'bcrypt';
import {
    DateFormat,
    MetadataKey,
    RANDOM_STRING_CHARACTERS,
    RetryConfig,
} from '../constants';
import dotenv from 'dotenv';
import dayjs from '../../plugins/dayjs';
import { camelCase, mapKeys } from 'lodash';
import winston from 'winston';
import Joi from 'src/plugins/joi';
import { AnySchema, ObjectSchema } from 'joi';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const DEFAULT_TIMEZONE_NAME = process.env.TIMEZONE_DEFAULT_NAME;

export function extractToken(authorization = '') {
    const prefix = 'Bearer ';
    if (authorization.startsWith(prefix)) {
        return authorization.substring(prefix.length, authorization.length);
    }
    return '';
}

export function hashPassword(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export function convertTimeToUTC(time: string | Date) {
    return dayjs.tz(time, 'UTC').toDate();
}

export function isEndOfDay(
    dateTime: string | Date,
    tzName = DEFAULT_TIMEZONE_NAME,
) {
    const time = dayjs
        .tz(convertTimeToUTC(dateTime), tzName)
        .format(DateFormat.HH_mm_ss_COLON);
    return /23:59:59/.test(time);
}

export function isStartOfDay(
    dateTime: string | Date,
    tzName = DEFAULT_TIMEZONE_NAME,
) {
    const time = dayjs
        .tz(convertTimeToUTC(dateTime), tzName)
        .format(DateFormat.HH_mm_ss_COLON);
    return /00:00:00/.test(time);
}

export function parseToCamelCase(data) {
    data = mapKeys(data, (value, key) => camelCase(key));
    return data;
}

export const customFormat = winston.format.printf((error) => {
    const message = error[Symbol.for('message')] as string;
    if (message) {
        return `${JSON.stringify(message)}`
            .replace(/\\n/g, '')
            .replace(/\s{2,}/g, '');
    }
    return `${JSON.stringify(message)}`;
});

export const generateRandomString = (length: number) => {
    const characters = RANDOM_STRING_CHARACTERS;
    const randomBytes = crypto.randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters[randomBytes[i] % characters.length];
    }

    return result;
};

export const convertClassToJoiRawObject = <T>(classType: ClassType<T>) => {
    try {
        const constructor = classType.prototype.constructor;
        const parentClassName = Object.getPrototypeOf(constructor)?.name;
        let joiObjectFromMetadata =
            Reflect.getMetadata(
                `${MetadataKey.JOI}_${constructor.name}`,
                constructor,
            ) ?? {};
        if (parentClassName?.length) {
            const parentJoiObjectFromMetadata = Reflect.getMetadata(
                `${MetadataKey.JOI}_${parentClassName}`,
                constructor,
            );
            if (parentJoiObjectFromMetadata) {
                joiObjectFromMetadata = {
                    ...parentJoiObjectFromMetadata,
                    ...joiObjectFromMetadata,
                };
            }
        }

        return joiObjectFromMetadata as Record<string, AnySchema<any>>;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return undefined;
    }
};

export const convertClassToJoiObjectSchema = <T>(
    classType: ClassType<T>,
): ObjectSchema<any> | undefined => {
    try {
        const joiObjectFromMetadata = convertClassToJoiRawObject(classType);
        if (joiObjectFromMetadata) {
            return Joi.object(joiObjectFromMetadata);
        }
        return undefined;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return undefined;
    }
};

export const parseSelectAttribute = (
    alias: string,
    attrs: string[],
    arrayFields: string[] = [],
): string[] => {
    return attrs?.map((attr) => {
        if (arrayFields.includes(attr)) {
            return `TO_JSON(${alias}.${attr}) AS "${attr}"`;
        }
        return `${alias}.${attr} AS "${attr}"`;
    });
};

export const parseSelectAttributeWithoutColumnAlias = (
    alias: string,
    attrs: string[],
): string[] => {
    return attrs?.map((attr) => `${alias}.${attr}`);
};

export const parseJsonSelectAttributeWhenJoin = (
    alias: string,
    attrs: string[],
): string => {
    const jsonBuild = attrs.map((attr) => `'${attr}', ${alias}.${attr}`);
    const result = `COALESCE(
        CASE 
            WHEN ${alias}.id IS NULL THEN NULL
            ELSE JSON_BUILD_OBJECT(${jsonBuild})
        END,
        NULL
    ) as "${alias}"`;
    return result;
};

export function generateRandomCode(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((num) => num % 10)
        .join('');
}

export function generateESSortQuery(
    orderBy?: string,
    order?: string,
): { [orderBy: string]: { order: string } }[] {
    orderBy = orderBy || '_score';
    order = order || 'desc';
    return [{ [orderBy]: { order } }, { id: { order: 'desc' } }];
}

export function roundMoney(amount: number): number {
    return Math.floor(amount);
}

export function roundTax(tax: number): number {
    return tax;
}

export function roundPoint(amount: number): number {
    return Math.ceil(amount);
}

export function generateUuid(): string {
    return uuidv4();
}

export function removeCommonProperty(obj: any) {
    const commonProperties = [
        'createdAt',
        'updatedAt',
        'deletedAt',
        'deletedBy',
        'createdBy',
        'updatedBy',
        'id',
    ];
    commonProperties.forEach((property) => {
        delete obj[property];
    });
    return obj;
}

export function calculateTax(amount: number, taxPercent: number): number {
    return roundTax((amount * taxPercent) / 100);
}

/**
 * Point = (Sale Price) / (Unit Price including tax)
 * => Point = (Sale Price) / ((Unit Price) * (1 + Tax rate))
 * => Point = (Sale Price) / ((Unit Price) * (1 + Tax percent/100))
 * => Point = (100* Sale Price) / ((Unit Price) * (100 + Tax percent))
 */
export function calculatePointFromSalesPrice(
    salesPrice: number,
    unitPrice: number,
    taxPercent: number,
): number {
    return roundPoint((salesPrice * 100) / (unitPrice * (100 + taxPercent)));
}

export function calculateUnitPriceIncludeTax(
    basedPrice: number,
    taxPercent: number,
) {
    return (basedPrice * (100 + taxPercent)) / 100;
}
/**
 * Point Unit Price = (Money) / (Based Price)
 * => Point Unit Price = (Money) / (Based Price)
 * => Point Unit Price = (Money) / (Based Price)
 * => Point Unit Price = (Money) / (Based Price)
 */
export const calculateNormalPointBaseOnSetting = (
    money: number,
    basedPrice: number,
) => {
    if (basedPrice === 0) {
        return 0;
    }
    const result = money / basedPrice;
    return result % 1 === 0 ? result : Math.ceil(result);
};

export const appendSizeToFilename = (filename: string, size: string) => {
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex === -1) {
        return `${filename}_${size}`; // Extension is not found
    }

    const namePart = filename.substring(0, lastDotIndex);
    const extension = filename.substring(lastDotIndex);

    return `${namePart}_${size}${extension}`;
};

export function compareByString(first, second) {
    return first?.toString() === second?.toString();
}

export function convertToNumberArray(
    value: string | string[] | number[],
): number[] {
    if (Array.isArray(value)) {
        return value.map((v) => Number(v));
    }
    return [Number(value)];
}

export function getFileNameFromPath(path: string): string {
    return path ? path.split('/').pop() : null;
}

export async function withRetry<T>(options: {
    operation: () => Promise<T>;
    maxRetries?: number;
    baseDelay?: number;
    logger?: LoggerWinston;
    operationName?: string;
}): Promise<T> {
    const {
        operation,
        maxRetries = RetryConfig.defaultMaxRetries,
        baseDelay = RetryConfig.defaultRetryDelay,
        logger,
        operationName = 'operation',
    } = options;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await operation();
            return result;
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                logger?.error(
                    `${operationName} failed after ${maxRetries} attempts. Last error: ${error}`,
                );
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                baseDelay * Math.pow(2, attempt - 1),
                RetryConfig.maxRetryDelay,
            );

            logger?.warn(
                `${operationName} failed on attempt ${attempt}/${maxRetries}. Retrying in ${delay}ms. Error: ${error}`,
            );

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    if (!(lastError instanceof Error)) {
        throw new Error(String(lastError));
    }
    throw lastError;
}

export function compareBoolean(
    a: boolean | string,
    b: boolean | string,
): boolean {
    return a?.toString() === b?.toString();
}
