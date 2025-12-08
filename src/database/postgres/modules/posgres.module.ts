import { Global, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { FileLogger } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as entities from '../entities';
import ConfigKey from '@/common/config/config-key';
import { NodeEnv } from '@/common/constants';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const logPath = 'logs/application.log';
                const logDir = path.dirname(logPath);

                // Create log directory if it doesn't exist
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }

                const options: TypeOrmModuleOptions = {
                    name: 'default',
                    type: 'postgres',
                    host: configService.get(ConfigKey.POSTGRES_HOST),
                    port: parseInt(configService.get(ConfigKey.POSTGRES_PORT)),
                    username: configService.get(ConfigKey.POSTGRES_USERNAME),
                    password: configService.get(ConfigKey.POSTGRES_PASSWORD),
                    database: configService.get(ConfigKey.POSTGRES_DATABASE),
                    entities: Object.values(entities),
                    logger: new FileLogger(
                        [NodeEnv.LOCAL, NodeEnv.DEVELOPMENT].includes(
                            configService.get(ConfigKey.NODE_ENV),
                        ),
                        {
                            logPath: 'logs/query.log',
                        },
                    ),
                    synchronize: false,
                };
                return options;
            },
        }),
    ],
    providers: [],
    exports: [],
})
export class PostgreModule {}
