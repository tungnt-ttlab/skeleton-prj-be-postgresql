// Mock dayjs trước khi import AuthHelper
jest.mock('src/plugins/dayjs', () => () => ({
    add: () => ({
        toISOString: () => '2024-01-01T00:00:00.000Z',
    }),
}));

import { AuthHelper } from './auth.helper';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ConfigKey from 'src/common/config/config-key';

describe('AuthHelper', () => {
    let helper: AuthHelper;
    let configService: { get: jest.Mock };
    let jwtService: { sign: jest.Mock; verifyAsync: jest.Mock };
    let loggerErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        configService = { get: jest.fn() };
        jwtService = { sign: jest.fn(), verifyAsync: jest.fn() };
        helper = new AuthHelper(
            configService as any as ConfigService,
            jwtService as any as JwtService,
        );
        loggerErrorSpy = jest
            .spyOn(helper.logger, 'error')
            .mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetModules();
    });

    describe('generateAccessToken', () => {
        it('should generate access token and return result', () => {
            configService.get.mockImplementation((key) => {
                if (key === ConfigKey.BACKEND_JWT_ACCESS_TOKEN_EXPIRED_IN)
                    return 3600;
                if (key === ConfigKey.BACKEND_JWT_ACCESS_TOKEN_SECRET_KEY)
                    return 'secret';
            });
            jwtService.sign.mockReturnValue('signed-token');

            const result = helper.generateAccessToken();
            expect(result).toEqual({
                token: 'signed-token',
                expiresIn: 3600,
                expiredAt: '2024-01-01T00:00:00.000Z',
            });
            expect(jwtService.sign).toHaveBeenCalledWith(
                {
                    expiresIn: 3600,
                    expiredAt: '2024-01-01T00:00:00.000Z',
                },
                {
                    secret: 'secret',
                    expiresIn: 3600,
                },
            );
        });

        it('should log and throw if error occurs', () => {
            configService.get.mockImplementation(() => {
                throw new Error('fail');
            });
            expect(() => helper.generateAccessToken()).toThrow('fail');
            expect(loggerErrorSpy).toHaveBeenCalled();
        });
    });

    describe('verifyToken', () => {
        it('should verify token and return result', async () => {
            const token = 'abc';
            const verified = { id: 1 };
            configService.get.mockReturnValue('secret');
            jwtService.verifyAsync.mockResolvedValue(verified);
            const result = await helper.verifyToken(token);
            expect(result).toBe(verified);
            expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
                secret: 'secret',
                ignoreExpiration: false,
            });
        });

        it('should log and throw if error occurs', async () => {
            jwtService.verifyAsync.mockRejectedValue(new Error('fail'));
            configService.get.mockReturnValue('secret');
            await expect(helper.verifyToken('abc')).rejects.toThrow('fail');
            expect(loggerErrorSpy).toHaveBeenCalled();
        });
    });
});
