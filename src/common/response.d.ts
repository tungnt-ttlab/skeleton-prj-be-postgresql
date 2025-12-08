type I18nKey = import('@/i18n/i18n').I18nKey;
type IErrorResponse = {
    errorKey: I18nKey;
    errorMessage: string;
    errorField?: string;
    order?: number;
    value?: any;
    errorKeyArgs?: any;
};

type JoiValidationCustomError = {
    messageI18nKey?: I18nKey;
};

type IGetListResponse<T = any> = {
    items: T[];
    totalItems: number;
};
