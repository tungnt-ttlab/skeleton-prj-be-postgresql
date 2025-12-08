import { Module } from '@nestjs/common';
import { AuthHelper } from './auth.helper';
import { JwtService } from '@nestjs/jwt';
import { AuthTestController } from './auth-test.controller';
@Module({
    providers: [JwtService, AuthHelper],
    controllers: [AuthTestController],
    exports: [AuthHelper],
})
export class AuthModule {}
