import { Inject, Logger } from '@nestjs/common';
import { I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants';
import { IServiceResponse } from '../interfaces';

export abstract class BaseValidator {
    @Inject()
    i18n!: I18nService;

    logger = new Logger(this.constructor.name, { timestamp: true });

    translate(key: I18nKey, options?: TranslateOptions): string {
        // In testing environment, I18nContext is not available
        return this.i18n.translate(key as string, {
            lang: I18nContext?.current?.()?.lang ?? DEFAULT_LANGUAGE,
            ...options,
        });
    }

    validatePageState(pageState?: string): IServiceResponse {
        try {
            if (!pageState) {
                return {
                    success: true,
                };
            }

            const decodedPageState = Buffer.from(pageState, 'hex');

            if (!decodedPageState) {
                return {
                    success: false,
                    errorKey: 'common.error.invalidPageStateFormat',
                };
            }

            return {
                success: true,
            };
        } catch (error) {
            this.logger.error(
                `Error in BaseValidator validatePageState: ${error}`,
            );
            throw error;
        }
    }
}
