import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '../constants';
import {
    createErrorResponse,
    createSuccessResponse,
} from '../helpers/swaggerResponse';

export enum SwaggerApiType {
    LOGIN = 'LOGIN',
    VERIFY_CODE = 'VERIFY_CODE',
    LOGOUT = 'LOGOUT',
    GET_LIST = 'GET_LIST',
    GET_DETAIL = 'GET_DETAIL',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    BULK_DELETE = 'BULK_DELETE',
    BULK_UPDATE = 'BULK_UPDATE',
    // TODO: Add api type for REFRESH_TOKEN
}

export enum SwaggerExample {
    ID = 1,
}

export function ApiResponseError(apiTypes: SwaggerApiType[]) {
    const decorators = [
        ApiResponse({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            description: 'Internal system error',
            schema: {
                // response example
                example: createErrorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    'SYSTEM_ERROR: 1625647014802-291ee2eb-59f3-4804-ba29-87d9b2bd73e9',
                ),
            },
        }),
    ];
    if (apiTypes.includes(SwaggerApiType.LOGIN)) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.UNAUTHORIZED,
                description: 'Email and/or Password is invalid',
                schema: {
                    // response example
                    example: createErrorResponse(
                        HttpStatus.UNAUTHORIZED,
                        'Unauthorized',
                    ),
                },
            }),
        );
    } else {
        decorators.push(
            ApiResponse({
                status: HttpStatus.UNAUTHORIZED,
                description: 'User is not authorized',
                schema: {
                    // response example
                    example: createErrorResponse(
                        HttpStatus.UNAUTHORIZED,
                        'Unauthorized',
                    ),
                },
            }),
        );
    }
    if (apiTypes.includes(SwaggerApiType.VERIFY_CODE)) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.ITEM_INVALID,
                description: 'Code = xxx is invalid',
                schema: {
                    // response example
                    example: createErrorResponse(
                        HttpStatus.ITEM_INVALID,
                        'Code is invalid',
                    ),
                },
            }),
        );
    }
    if (
        apiTypes.includes(SwaggerApiType.GET_DETAIL) ||
        apiTypes.includes(SwaggerApiType.UPDATE) ||
        apiTypes.includes(SwaggerApiType.DELETE)
    ) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.ITEM_NOT_FOUND,
                description: 'The item with id = xxx does not exist',
                schema: {
                    // response example
                    example: createErrorResponse(
                        HttpStatus.ITEM_NOT_FOUND,
                        'Item does not exist',
                    ),
                },
            }),
        );
    }
    if (
        apiTypes.includes(SwaggerApiType.CREATE) ||
        apiTypes.includes(SwaggerApiType.UPDATE) ||
        apiTypes.includes(SwaggerApiType.GET_LIST) ||
        apiTypes.includes(SwaggerApiType.BULK_DELETE) ||
        apiTypes.includes(SwaggerApiType.BULK_UPDATE)
    ) {
        decorators.push(
            ApiResponse({
                status: HttpStatus.BAD_REQUEST,
                description: 'Invalid parameter and/or body request',
                schema: {
                    // response example
                    example: createErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        'Bad Request Exception',
                        [
                            {
                                errorField: 'name',
                                errorKey: 'errors.isRequired',
                                errorMessage: 'Name is required',
                            },
                        ],
                    ),
                },
            }),
        );
    }
    return applyDecorators(...decorators);
}

export function ApiResponseSuccess(data: unknown) {
    return applyDecorators(
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Success response example',
            schema: {
                // response example
                example: createSuccessResponse(data),
            },
        }),
    );
}
