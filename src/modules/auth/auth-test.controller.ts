import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from 'src/common/helpers/response';
import {
    ApiResponseError,
    ApiResponseSuccess,
    SwaggerApiType,
} from 'src/common/services/swagger.service';
import { NodeEnv } from 'src/common/constants';
import { ConfigService } from '@nestjs/config';
import { AuthHelper } from './auth.helper';

// TODO: Remove before production
@ApiTags(
    'Authentication APIs for testing in local environment. Remove before production.',
)
@ApiBearerAuth()
@Controller('test/auth')
export class AuthTestController {
    constructor(
        private readonly authHelper: AuthHelper,
        private readonly configService: ConfigService,
    ) {}

    @ApiOperation({ summary: 'Login' })
    @ApiResponseError([SwaggerApiType.LOGIN])
    @ApiResponseSuccess({})
    @Get('login')
    async login() {
        if (this.configService.get('NODE_ENV') === NodeEnv.PRODUCTION) {
            return new SuccessResponse();
        }

        const accessToken = this.authHelper.generateAccessToken();

        return new SuccessResponse({
            accessToken,
        });
    }
}
