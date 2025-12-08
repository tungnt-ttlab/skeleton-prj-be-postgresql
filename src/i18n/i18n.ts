/* eslint-disable */
import { I18nContext, TranslateOptions } from 'nestjs-i18n';
import en from './en';

/**.0
 * Builds up valid keypaths for translations.
 * Update to your default locale of choice if not English.
 */
export type DefaultLocale = typeof en;
/*eslint-disable-next-line @typescript-eslint/ban-types*/
export type I18nKey = RecursiveKeyOf<DefaultLocale>;

type RecursiveKeyOf<TObj extends Record<string, any>> = {
    [TKey in keyof TObj & string]: TObj[TKey] extends Record<string, any>
        ? // @ts-ignore
          `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
        : `${TKey}`;
}[keyof TObj & string];

/**
 * Translates text.
 *
 * @param key The i18n key.
 */
export function translate(key: I18nKey, options?: TranslateOptions): string {
    return I18nContext.current().t(key, options);
}
