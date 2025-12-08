import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from './i18n/i18n.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/exceptions.filter';
import { AuthModule } from './modules/auth/auth.module';
import envSchema from './common/config/validation-schema';
import { TransformInterceptor } from './common/transform.interceptor';
import { HeaderMiddleware } from './common/middleware/header.middleware';
import { PostgreModule } from './database/postgres/modules/posgres.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
            validationSchema: envSchema,
        }),
        I18nModule,
        PostgreModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            scope: Scope.REQUEST,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HeaderMiddleware).forRoutes('*');
    }
}
