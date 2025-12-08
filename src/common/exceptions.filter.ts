import {
    Catch,
    ArgumentsHost,
    HttpException,
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { BaseExceptionFilter } from '@nestjs/core';
import { uniqueId } from 'lodash';
import { Context, ValidationErrorItem } from 'joi';
import { HttpStatus } from './constants';
import { CustomException } from './exceptions/custom.exception';

const translateErrorValidator = (
    errors: ValidationErrorItem[],
    i18n: I18nService,
) => {
    const errorMessages = errors.map((error: ValidationErrorItem) => {
        const { type, path } = error;
        const context = error?.context as Context & JoiValidationCustomError;
        const key = ['validation', type].join('.');
        // translate label
        context.label = i18n.translate(context.label);
        const { errorCode, name } = context;
        // translate message
        let messageKey = '';
        if (context?.messageI18nKey?.length) {
            messageKey = context.messageI18nKey as string;
        } else if (errorCode?.length) {
            messageKey = `errors.${errorCode}`;
        } else if (name?.length) {
            messageKey = name;
        } else {
            messageKey = key;
        }

        return {
            errorField: path.join('.'),
            errorCode: errorCode ?? HttpStatus.BAD_REQUEST,
            errorKey: messageKey,
            errorMessage: i18n.translate(messageKey, { args: context }),
            value: context?.value,
        } as IErrorResponse;
    });

    return errorMessages;
};

const handleBadRequestException = (
    exception: BadRequestException,
    i18n: I18nService,
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = exception.getResponse() as any;
    let errors = [];

    if (Array.isArray(response.errors) && response?.errors.length > 0) {
        errors = translateErrorValidator(response.errors, i18n);
    }
    return {
        code: HttpStatus.BAD_REQUEST,
        message: exception.message,
        errors,
    };
};

const handleInternalErrorException = (
    exception: InternalServerErrorException,
    request: Request,
    logger: Logger,
    i18n: I18nService,
) => {
    const logId = `${Date.now()}${uniqueId()}`;
    const message = `System error with id = ${logId}: ${exception.message}`;
    // write detail log to trace bug
    logger.error(message, {
        requestUrl: request.url,
        request: request.body,
        exception,
    });
    // return only logId
    return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: i18n.translate('errors.500', {
            lang: request?.headers['accept-language'],
            args: { param: logId },
        }),
        errors: [],
    };
};

const handleCustomException = (
    exception: CustomException,
    i18n: I18nService,
) => {
    const httpStatus = exception.getStatus();
    return {
        code: httpStatus,
        message: i18n.translate(`errors.${httpStatus}`),
        errors: [
            {
                errorField: exception?.errorField,
                errorKey: exception.errorKey,
                errorMessage: i18n.translate(exception.errorKey, {
                    args: exception?.errorKeyArgs,
                }),
                description: exception.httpOptions?.description,
            },
        ],
    };
};

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService,
    ) {
        super();
    }
    private readonly logger = new Logger();
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiResponse = exception.getResponse() as any;
        const status = exception.getStatus();
        let parsedResponse = {
            code: exception.getStatus(),
            message: this.i18n.translate(`errors.${status}`, {
                lang: request?.headers['accept-language'],
            }),
            errors: apiResponse?.errors || [],
        };
        this.logger.error(apiResponse.message, {
            requestUrl: request.url,
            request: request.body,
            exception,
        });
        if (exception instanceof InternalServerErrorException) {
            parsedResponse = handleInternalErrorException(
                exception,
                request,
                this.logger,
                this.i18n,
            );
        } else if (exception instanceof BadRequestException) {
            parsedResponse = handleBadRequestException(exception, this.i18n);
        } else if (exception instanceof CustomException) {
            parsedResponse = handleCustomException(exception, this.i18n);
        }
        return response.status(status).json(parsedResponse);
    }
}
