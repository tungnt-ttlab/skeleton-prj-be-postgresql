import { applyDecorators } from '@nestjs/common';
import Joi from 'joi';
import { MetadataKey } from '../constants';

type JoiObjectSchema = { [key: string]: Joi.AnySchema };

export function JoiValidate(schema: Joi.AnySchema): PropertyDecorator {
    const JoiDecorator: PropertyDecorator = (target, propertyName: string) => {
        const className = target.constructor.name;

        let joiObject: JoiObjectSchema =
            Reflect.getMetadata(
                `${MetadataKey.JOI}_${className}`,
                target.constructor,
            ) ?? {};

        joiObject[propertyName] = schema;
        const parentClassName = Object.getPrototypeOf(target.constructor)
            ?.name as string;
        if (parentClassName?.length) {
            const parentJoiObject: JoiObjectSchema =
                Reflect.getMetadata(
                    `${MetadataKey.JOI}_${parentClassName}`,
                    target.constructor,
                ) ?? {};
            if (parentJoiObject) {
                joiObject = { ...parentJoiObject, ...joiObject };
            }
        }

        Reflect.defineMetadata(
            `${MetadataKey.JOI}_${className}`,
            joiObject,
            target.constructor,
        );
    };

    return applyDecorators(...[JoiDecorator]);
}
