import Joi from '../plugins/joi';

export enum Languages {
    EN = 'en',
    JA = 'ja',
}

export enum OrderDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum OrderBy {
    ID = 'id',
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
}

export const DEFAULT_PORT = 3000;
export const LANGUAGE_HEADER = 'accept-language';
export const DEFAULT_LANGUAGE = Languages.EN;
export const TIMEZONE_HEADER = 'x-timezone';
export const TIMEZONE_NAME_HEADER = 'x-timezone-name';
export const TIMEZONE_DEFAULT = '+09:00';
export const TIMEZONE_NAME_DEFAULT = 'Asia/Tokyo';

export const DEFAULT_LIMIT_FOR_DROPDOWN = 1000;
export const DEFAULT_LIMIT_FOR_PAGINATION = 10;
export const DEFAULT_FIRST_PAGE = 1;
export const DEFAULT_ORDER_BY = 'createdAt';
export const DEFAULT_ORDER_DIRECTION = OrderDirection.DESC;
export const DEFAULT_MIN_DATE = '1970-01-01 00:00:00';
export const DEFAULT_MAX_DATE = '3000-01-01 00:00:00';

export const MIN_ID = 1;
export const MIN_PAGE_LIMIT = 1; // min item per one page
export const MIN_PAGE = 1; // min page value
export const MAX_PAGE_LIMIT = 10000; // max item per one page
export const MAX_PAGE = 10000; // max page value
export const INPUT_TEXT_MAX_LENGTH = 255;
export const TEXTAREA_MAX_LENGTH = 2000;
export const ARRAY_MAX_LENGTH = 500;
export const MAX_INTEGER = 2147483647;

export const Regex = {
    URI: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    NUMBER: /^\d*$/,
    PHONE: /^\d{1,14}$/,
    URL: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._~#=-]{2,256}\.[a-z]{2,6}([-a-zA-Z0-9@:%_~#?&/=]*)/,
    APP_LINK: /^[a-zA-Z0-9-]+:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+$/,
    PAGE_STATE: /^([0-9a-fA-F]{2})+$/,
};

export const softDeleteCondition = {
    $or: [
        {
            deletedAt: {
                $exists: true,
                $eq: null,
            },
        },
        {
            deletedAt: {
                $exists: false,
            },
        },
    ],
};

export enum DateFormat {
    YYYY_MM_DD_HYPHEN = 'YYYY-MM-DD',
    HH_mm_ss_COLON = 'HH:mm:ss',
    YYYY_MM_DD_HYPHEN_HH_mm_ss_COLON = 'YYYY-MM-DD HH:mm:ss',
    YYYY_MMM_DD_HYPHEN_HH_mm_ss_COLON = 'YYYY-MMM-DD HH:mm:ss',
    YYYY_MM_DD_HYPHEN_HH_mm_ss_Z_COLON = 'YYYY-MM-DD HH:mm:ssZ',
    DD_MM_YYYY_SLASH_HH_mm_ss_COLON = 'YYYY/MM/DD HH:mm:ss',
    YY_MM_DD_HH_mm = 'YYMMDDHHmm',
    HH_mm_COLON_DD_MM_YYYY_SLASH = 'HH:mm DD/MM/YYYY',
    ISO = 'YYYY-MM-DDTHH:mm:ss[Z]',
    ISO_sss = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    ISO_TZ = 'YYYY-MM-DDTHH:mm:ssZ',
    ISO_TZ_sss = 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    YYYY_MM_HYPHEN = 'YYYY-MM',
    DD_MM_YYYY = 'DDMMYYYY',
}

export const CommonListQuerySchema = {
    page: Joi.number().min(MIN_PAGE).max(MAX_PAGE).optional().allow(null),
    limit: Joi.number()
        .min(MIN_PAGE_LIMIT)
        .max(MAX_PAGE_LIMIT)
        .optional()
        .allow(null),
    keyword: Joi.string().max(INPUT_TEXT_MAX_LENGTH).optional().allow(null, ''),
    orderDirection: Joi.string()
        .valid(...Object.values(OrderDirection))
        .optional(),
    orderBy: Joi.string()
        .valid(...Object.values(OrderBy))
        .optional(),
};

export const CommonGetDetailSchema = Joi.isParamId().required().label('id');

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    ITEM_NOT_FOUND = 444,
    ITEM_ALREADY_EXIST = 445,
    ITEM_INVALID = 446,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
}

export enum BooleanString {
    TRUE = 'true',
    FALSE = 'false',
}

export enum MetadataKey {
    JOI = 'JOI',
}

export enum NodeEnv {
    LOCAL = 'local',
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    STAGING = 'staging',
}

export const DEFAULT_WAIT_TIME = 500;

export const RANDOM_STRING_CHARACTERS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const DEFAULT_SUCCESS_MESSAGE = 'success';

export enum AccountType {
    USER = 'user',
    PERFORMER = 'performer',
    SYSTEM = 'system',
}

export const RetryConfig = {
    defaultMaxRetries: 3,
    defaultRetryDelay: 1000,
    maxRetryDelay: 5000,
};
