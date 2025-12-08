import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    PipeTransform,
    Scope,
} from '@nestjs/common';
import {
    ObjectSchema,
    ValidationResult,
    ValidationError,
    StringSchema,
    NumberSchema,
} from 'joi';
import { convertClassToJoiObjectSchema } from '../helpers/commonFunctions';

@Injectable({ scope: Scope.REQUEST })
export class JoiValidationPipe implements PipeTransform {
    constructor(
        private readonly schema?: ObjectSchema | StringSchema | NumberSchema,
    ) {}

    transform(value: any, metadata: ArgumentMetadata) {
        const metatype = metadata?.metatype;
        let joiSchema = this.schema;
        if (metatype && !this.schema) {
            joiSchema = convertClassToJoiObjectSchema(metatype);
        }

        if (!joiSchema?.validate)
            throw new InternalServerErrorException('Joi schema not found');

        const { error } = joiSchema.validate(value, {
            abortEarly: false,
        }) as ValidationResult;
        if (error) {
            const { details } = error as ValidationError;
            throw new BadRequestException({ errors: details });
        }
        return value;
    }
}
