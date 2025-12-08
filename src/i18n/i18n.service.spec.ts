import { I18nService } from './i18n.service';
import { DEFAULT_LANGUAGE } from '../common/constants';

describe('I18nService', () => {
    let service: I18nService;
    let i18nMock: any;
    let i18nContextCurrentSpy: jest.SpyInstance;

    beforeEach(() => {
        i18nMock = { translate: jest.fn().mockReturnValue('translated') };
        service = new I18nService();
        service.i18n = i18nMock;
    });

    afterEach(() => {
        if (i18nContextCurrentSpy) i18nContextCurrentSpy.mockRestore();
    });

    it('should translate with lang from I18nContext', () => {
        i18nContextCurrentSpy = jest
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            .spyOn(require('nestjs-i18n').I18nContext, 'current')
            .mockReturnValue(() => ({ lang: 'en' }));
        const result = service.translate('key' as any, { args: { a: 1 } });
        expect(i18nMock.translate).toHaveBeenCalledWith(
            'key',
            expect.objectContaining({ lang: 'en', args: { a: 1 } }),
        );
        expect(result).toBe('translated');
    });

    it('should fallback to DEFAULT_LANGUAGE if I18nContext is not available', () => {
        i18nContextCurrentSpy = jest
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            .spyOn(require('nestjs-i18n').I18nContext, 'current')
            .mockReturnValue(undefined);
        const result = service.translate('key' as any);
        expect(i18nMock.translate).toHaveBeenCalledWith(
            'key',
            expect.objectContaining({ lang: DEFAULT_LANGUAGE }),
        );
        expect(result).toBe('translated');
    });
});
