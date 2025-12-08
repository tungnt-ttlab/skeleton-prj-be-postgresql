import { Inject, Logger } from '@nestjs/common';
import { I18nContext, I18nService, TranslateOptions } from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../constants';

export abstract class BaseService {
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
}
