import { HttpException, HttpExceptionOptions } from '@nestjs/common';
import { HttpStatus } from '../constants';

export class CustomException extends HttpException {
    errorField: string;
    errorKey: I18nKey;
    errorKeyArgs?: any;
    httpOptions?: HttpExceptionOptions;

    constructor(options: {
        status: HttpStatus;
        errorKey: I18nKey;
        errorField?: string;
        httpOptions?: HttpExceptionOptions;
        errorKeyArgs?: any;
    }) {
        const { status, errorKey, errorField, httpOptions, errorKeyArgs } =
            options;
        super(errorKey, status, httpOptions);

        this.errorField = errorField;
        this.errorKey = errorKey;
        this.errorKeyArgs = errorKeyArgs;
        this.httpOptions = httpOptions;
    }
}

export class CustomForbiddenException extends CustomException {
    constructor(options: {
        errorKey: I18nKey;
        errorField?: string;
        httpOptions?: HttpExceptionOptions;
        errorKeyArgs?: any;
    }) {
        super({
            status: HttpStatus.FORBIDDEN,
            ...options,
        });
    }
}

export class CustomUnauthorizedException extends CustomException {
    constructor(options: {
        errorKey: I18nKey;
        errorField?: string;
        httpOptions?: HttpExceptionOptions;
        errorKeyArgs?: any;
    }) {
        super({
            status: HttpStatus.UNAUTHORIZED,
            ...options,
        });
    }
}
