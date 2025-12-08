import {
    HttpException,
    Inject,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE, HttpStatus } from '../constants';
import { IServiceResponse } from '../interfaces';
import { ErrorResponse } from '../helpers/response';
export class BaseController {
    @Inject()
    i18n: I18nService;

    logger = new Logger(this.constructor.name, { timestamp: true });

    translate(key: I18nKey, options?: TranslateOptions): string {
        // In testing environment, I18nContext is not available
        return this.i18n.translate(key as string, {
            lang: I18nContext?.current?.()?.lang ?? DEFAULT_LANGUAGE,
            ...options,
        });
    }

    handleError(err: any): void {
        if (err && err instanceof HttpException) {
            throw err;
        }
        throw new InternalServerErrorException(err);
    }

    returnErrorResponse(serviceResponse: IServiceResponse) {
        if (serviceResponse?.errorResponse) {
            return serviceResponse.errorResponse;
        }
        const errorKey = serviceResponse?.errorKey || 'errors.400';
        return new ErrorResponse(
            HttpStatus.BAD_REQUEST,
            this.translate('errors.400'),
            [
                {
                    errorField: serviceResponse?.errorField,
                    errorMessage: this.translate(errorKey, {
                        args: serviceResponse?.errorKeyArgs,
                    }),
                    errorKey: serviceResponse?.errorKey,
                },
            ],
        );
    }
}
