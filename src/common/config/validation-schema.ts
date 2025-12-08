import Joi from 'joi';
import ConfigKey from './config-key';
import { DEFAULT_PORT, NodeEnv } from '../constants';

export default Joi.object({
    [ConfigKey.NODE_ENV]: Joi.string().valid(...Object.values(NodeEnv)),
    [ConfigKey.APP_PORT]: Joi.number().default(DEFAULT_PORT),

    // cors
    [ConfigKey.CORS_WHITELIST]: Joi.string().required(),

    // API PREFIX URL
    [ConfigKey.APP_PREFIX]: Joi.string().required(),

    // Logging
    [ConfigKey.LOG_ENABLE_LOG_TO_FILE]: Joi.boolean().required(),
    [ConfigKey.LOG_ROOT_FOLDER]: Joi.string().required(),
    [ConfigKey.LOG_MAX_FILES]: Joi.number().required(),
    [ConfigKey.LOG_MAX_SIZE]: Joi.number().required(),
    [ConfigKey.LOG_LEVEL]: Joi.string().required(),

    // Database
    [ConfigKey.POSTGRES_HOST]: Joi.string().required(),
    [ConfigKey.POSTGRES_PORT]: Joi.alternatives()
        .try(Joi.string(), Joi.number())
        .required(),
    [ConfigKey.POSTGRES_USERNAME]: Joi.string().required(),
    [ConfigKey.POSTGRES_PASSWORD]: Joi.string().required(),
    [ConfigKey.POSTGRES_DATABASE]: Joi.string().required(),

    // JWT - authentication
    [ConfigKey.JWT_ACCESS_TOKEN_SECRET]: Joi.string().required(),
    [ConfigKey.JWT_ACCESS_TOKEN_EXPIRED_IN]: Joi.number().required(),
    [ConfigKey.JWT_REFRESH_TOKEN_SECRET]: Joi.string().required(),
    [ConfigKey.JWT_REFRESH_TOKEN_EXPIRED_IN]: Joi.number().required(),

    // AWS
    [ConfigKey.AWS_REGION]: Joi.string().required(),
    [ConfigKey.AWS_ACCESS_KEY_ID]: Joi.string().required(),
    [ConfigKey.AWS_SECRET_ACCESS_KEY]: Joi.string().required(),
    [ConfigKey.AWS_S3_BUCKET]: Joi.string().required(),
    [ConfigKey.AWS_S3_SIGNED_URL_EXPIRED_IN_SECOND]: Joi.number().required(),

    // Cloud Front
    [ConfigKey.CLOUD_FRONT_URL]: Joi.string().required(),
});
