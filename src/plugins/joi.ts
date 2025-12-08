import { DateFormat } from '@/common/constants';
import JoiBase, { ExtensionFactory } from 'joi';
import dayjs from './dayjs';

export const paramIdExtensionValidateHelper = (
    value: any,
    helpers: JoiBase.CustomHelpers,
) => {
    const positiveIntegerPattern = /^[1-9]\d*$/;
    if (!positiveIntegerPattern.test(value)) {
        return { value, errors: helpers.error('number.base') };
    }
    const stringSchema = JoiBase.string();
    const stringValidation = stringSchema.validate(value);
    if (stringValidation.error) {
        return { value, errors: helpers.error('number.base') };
    }

    const numberSchema = JoiBase.number().integer().min(1);
    const validation = numberSchema.validate(value);
    if (value && validation.error) {
        return { value, errors: validation.error };
    }
    return { value };
};

const joiDateExtension: ExtensionFactory = (joi: JoiRoot) => {
    return {
        type: 'isIsoDate',
        base: joi.string(),
        validate(value: any, helpers: JoiBase.CustomHelpers) {
            const isoDateFormats = [
                DateFormat.ISO,
                DateFormat.ISO_sss,
                DateFormat.ISO_TZ,
                DateFormat.ISO_TZ_sss,
            ];
            if (
                value &&
                !isoDateFormats.some((format) =>
                    dayjs(value, format, true).isValid(),
                )
            ) {
                return { value, errors: helpers.error('string.isoDate') };
            }
            return { value };
        },
    };
};

export const JoiParamIdExtension: ExtensionFactory = (joi: JoiRoot) => {
    return {
        type: 'isParamId',
        base: joi.string(),
        validate(value: any, helpers: JoiBase.CustomHelpers) {
            return paramIdExtensionValidateHelper(value, helpers);
        },
    };
};

const Joi = JoiBase.extend(
    JoiParamIdExtension,
    joiDateExtension,
) as typeof JoiBase & {
    isParamId(): JoiBase.StringSchema;
    isIsoDate(): JoiBase.StringSchema;
};

export default Joi;
