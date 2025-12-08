import { Injectable } from '@nestjs/common';
import { DEFAULT_SUCCESS_MESSAGE, HttpStatus } from '../constants';
import dotenv from 'dotenv';
dotenv.config();

const { VERSION: version = '1.0.0' } = process.env;

export interface IErrorResponse {
    errorField?: string;
    order?: number;
    errorMessage: string;
    value?: any;
    errorKey: string;
}

export class SuccessResponse {
    code = HttpStatus.OK;
    success: boolean;
    data: any;
    message: string;

    constructor(data = {}) {
        this.success = true;
        this.data = data;
        this.message = 'success';
    }
}
export class ErrorResponse {
    code: number;
    message: string;
    errors?: IErrorResponse[];
    version: string;

    constructor(
        code = HttpStatus.INTERNAL_SERVER_ERROR,
        message = '',
        errors?: IErrorResponse[],
    ) {
        this.code = code;
        this.message = message;
        this.errors = errors;
        this.version = version;
    }
}
export class HttpResponse<T = string> {
    code: T;
    message: string;
    data: any;

    constructor(code: T, message = DEFAULT_SUCCESS_MESSAGE, data?: any) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}

@Injectable()
export class ApiResponse<T> {
    public code: number;

    public message: string;

    public data: T;

    public errors: IErrorResponse[];
}
