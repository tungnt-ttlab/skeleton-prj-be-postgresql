import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BaseService } from 'src/common/base/base.service';
import ConfigKey from 'src/common/config/config-key';
import dayjs from 'src/plugins/dayjs';
import {
    IAccountToken,
    IAccountTokenPayload,
    IGenerateTokenResult,
} from './auth.interfaces';

@Injectable()
export class AuthHelper extends BaseService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {
        super();
    }

    generateAccessToken(): IGenerateTokenResult {
        try {
            const expiresIn = this.configService.get(
                ConfigKey.JWT_ACCESS_TOKEN_EXPIRED_IN,
            );
            const secretKey = this.configService.get(
                ConfigKey.JWT_ACCESS_TOKEN_SECRET,
            );
            const options = {
                secret: secretKey,
                expiresIn: expiresIn,
            };

            const expiredAt = dayjs().add(expiresIn, 'seconds').toISOString();

            const payloadToken: IAccountTokenPayload = {
                expiresIn,
                expiredAt,
            };
            const accessToken = this.jwtService.sign(payloadToken, options);
            return {
                token: accessToken,
                expiresIn,
                expiredAt,
            };
        } catch (error) {
            this.logger.error(
                `Error in AuthHelper generateAccessToken: ${error}`,
            );
            throw error;
        }
    }

    async verifyToken(token: string): Promise<IAccountToken> {
        try {
            const verifiedToken: IAccountToken =
                await this.jwtService.verifyAsync(token, {
                    secret: this.configService.get(
                        ConfigKey.JWT_ACCESS_TOKEN_SECRET,
                    ),
                    ignoreExpiration: false,
                });

            return verifiedToken;
        } catch (error) {
            this.logger.error('Error in AuthHelper verifyToken: ' + error);
            throw error;
        }
    }
}
