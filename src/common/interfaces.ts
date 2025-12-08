import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    MAX_INTEGER,
    MAX_PAGE,
    MAX_PAGE_LIMIT,
    MIN_PAGE,
    MIN_PAGE_LIMIT,
    OrderBy,
    OrderDirection,
} from './constants';
import { JoiValidate } from './decorators/validator.decorator';
import Joi from '../plugins/joi';

export class PaginationQuery {
    @ApiPropertyOptional({
        type: Number,
        description: 'Specify the page of results to return',
        default: 1,
        minimum: 1,
        maximum: MAX_INTEGER,
    })
    @JoiValidate(
        Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional().allow(null),
    )
    page?: number;

    @ApiPropertyOptional({
        type: Number,
        description: 'The number of items returned in the response',
        default: 10,
        minimum: 1,
        maximum: MAX_INTEGER,
    })
    @JoiValidate(
        Joi.number()
            .min(MIN_PAGE_LIMIT)
            .max(MAX_PAGE_LIMIT)
            .optional()
            .allow(null),
    )
    limit?: number;
}

export interface IServiceResponse<T = any> {
    success: boolean;
    errorField?: string;
    errorMessage?: string;
    errorKey?: I18nKey;
    errorKeyArgs?: any;
    errorResponse?: ErrorResponse;
    data?: T;
}

export class CommonListQuery extends PaginationQuery {
    @ApiPropertyOptional({
        enum: OrderBy,
        description: 'Which field used to sort',
        default: OrderBy.CREATED_AT,
    })
    @JoiValidate(
        Joi.string()
            .valid(...Object.values(OrderBy))
            .optional(),
    )
    orderBy?: string;

    @ApiPropertyOptional({
        enum: OrderDirection,
        description: 'ASC or DESC',
        default: OrderDirection.DESC,
    })
    @JoiValidate(
        Joi.string()
            .valid(...Object.values(OrderDirection))
            .optional(),
    )
    orderDirection?: OrderDirection;
}
