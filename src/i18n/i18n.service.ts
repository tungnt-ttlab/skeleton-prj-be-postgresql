import { Inject, Injectable } from '@nestjs/common';
import {
    I18nContext,
    I18nService as I18nServiceNest,
    TranslateOptions,
} from 'nestjs-i18n';
import { DEFAULT_LANGUAGE } from '../common/constants';

@Injectable()
export class I18nService {
    @Inject()
    i18n!: I18nServiceNest;

    translate(key: I18nKey, options?: TranslateOptions): string {
        // In testing environment, I18nContext is not available
        return this.i18n.translate(key as string, {
            ...options,
            lang: I18nContext?.current?.()?.lang ?? DEFAULT_LANGUAGE,
        });
    }
}
