import dotenv from 'dotenv';
import { IErrorResponse } from './response';
import { DEFAULT_SUCCESS_MESSAGE, HttpStatus } from '../constants';
dotenv.config();

export interface ISuccessResponse<T = any> {
    code: HttpStatus;
    message: string;
    data: T;
}

export interface IErrorResponseDto {
    code: HttpStatus;
    message: string;
    errors: IErrorResponse[];
}

export const createSuccessResponse = (data = {}): ISuccessResponse => ({
    code: HttpStatus.OK,
    message: DEFAULT_SUCCESS_MESSAGE,
    data,
});

export const createErrorResponse = (
    code: HttpStatus,
    message = '',
    errors: IErrorResponse[] = [],
): IErrorResponseDto => ({
    code,
    message,
    errors,
});
