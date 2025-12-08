import Joi from '@/plugins/joi';
import {
    DateFormat,
    INPUT_TEXT_MAX_LENGTH,
    MAX_INTEGER,
    MIN_ID,
    Regex,
    TEXTAREA_MAX_LENGTH,
} from '../constants';
import dayjs from '@/plugins/dayjs';

export const emailSchema = Joi.string()
    .trim()
    .max(INPUT_TEXT_MAX_LENGTH)
    .regex(new RegExp(Regex.EMAIL));

export const phoneNumberSchema = Joi.string().regex(new RegExp(Regex.PHONE));

export const shortStringSchema = Joi.string().trim().max(INPUT_TEXT_MAX_LENGTH);

export const longStringSchema = Joi.string().trim().max(TEXTAREA_MAX_LENGTH);

export const idSchema = Joi.number().min(MIN_ID).max(MAX_INTEGER);
export const idStringSchema = Joi.string().trim();

export const isoDateSchema = Joi.isIsoDate();

export const birthdaySchema = Joi.string().custom((value, helpers) => {
    if (!dayjs(value, DateFormat.YYYY_MM_DD_HYPHEN, true).isValid()) {
        return helpers.error('date.format', {
            format: DateFormat.YYYY_MM_DD_HYPHEN,
        });
    }

    return value;
});

export const pageStateSchema = Joi.string()
    .regex(new RegExp(Regex.PAGE_STATE))
    .allow(null, '')
    .optional();

export const pointSchema = Joi.number().integer().max(MAX_INTEGER);

export const datePeriodSchema = (maxDurationDays?: number) =>
    Joi.array()
        .items(isoDateSchema)
        .length(2)
        .custom((value: string[], helpers) => {
            const [start, end] = value;
            const startDate = dayjs(start);
            const endDate = dayjs(end);

            if (startDate.isAfter(endDate)) {
                return helpers.error('dateRange.startBeforeEnd');
            }

            if (maxDurationDays !== undefined) {
                const diff = endDate.diff(startDate, 'day');
                if (diff >= maxDurationDays) {
                    return helpers.error(
                        'dateRange.endGreaterThanStartAtMostDay',
                        {
                            value: maxDurationDays,
                        },
                    );
                }
            }

            return value;
        }, 'Date range validation')
        .optional();
