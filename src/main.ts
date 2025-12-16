import 'winston-daily-rotate-file';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import ConfigKey from './common/config/config-key';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import winston, { transports } from 'winston';
import { customFormat } from './common/helpers/commonFunctions';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const DEFAULT_PORT = 3000;
const { combine, prettyPrint, colorize, simple } = winston.format;

async function bootstrap() {
    const isLocal = process.env.NODE_ENV === 'local';
    const loggerTransports: winston.transport[] = [
        // we also want to see logs in our console
        new transports.Console({
            format: combine(colorize(), simple()),
        }),
        new transports.Console({
            format: isLocal
                ? combine(prettyPrint())
                : combine(prettyPrint(), customFormat),
            level: 'error',
        }),
    ];

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: WinstonModule.createLogger({
            transports: loggerTransports,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf((info) =>
                    JSON.stringify({ timestamp: info?.timestamp, ...info }),
                ),
            ),
        }),
    });
    app.useStaticAssets(join(__dirname, '..', 'public'));
    const configService = app.get(ConfigService);
    const whiteList = configService.get(ConfigKey.CORS_WHITELIST) || '*';
    const corsOptions: CorsOptions = {
        origin:
            whiteList?.split(',')?.length > 1
                ? whiteList.split(',')
                : whiteList,
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Language',
            'X-Timezone',
            'X-Timezone-Name',
        ],
        optionsSuccessStatus: 200,
        methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    };
    app.enableCors(corsOptions);

    // setup prefix of route
    app.setGlobalPrefix(configService.get(ConfigKey.APP_PREFIX));

    // config swagger
    const config = new DocumentBuilder()
        .addBearerAuth()
        .setTitle('Test Service API')
        .setDescription('The Test Service API description')
        .setVersion('v1')
        .addTag('test')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(configService.get(ConfigKey.APP_PORT) || DEFAULT_PORT);
}
bootstrap();
