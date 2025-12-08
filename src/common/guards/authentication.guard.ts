import {
    CanActivate,
    ExecutionContext,
    HttpException,
    Injectable,
} from '@nestjs/common';
import { extractToken } from '../helpers/commonFunctions';
import { AuthHelper } from 'src/modules/auth/auth.helper';
import { HttpStatus } from '../constants';
import { CustomUnauthorizedException } from '../exceptions/custom.exception';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private readonly authHelper: AuthHelper) {
        //
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();

            // Extract token from header
            const token = extractToken(request.headers.authorization);
            if (!token) {
                throw new CustomUnauthorizedException({
                    errorKey: 'auth.error.token.missing',
                });
            }

            // Validate token
            await this.authHelper.verifyToken(token);
            return true;
        } catch (error) {
            if (error && error instanceof HttpException) {
                throw error;
            }
            throw new CustomUnauthorizedException({
                errorKey: `errors.${HttpStatus.UNAUTHORIZED}`,
            });
        }
    }
}
