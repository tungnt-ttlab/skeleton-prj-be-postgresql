import * as dotenv from 'dotenv';
import ConfigKey from './config-key';
import validationSchema from './validation-schema';
dotenv.config();

const config = {} as { [key in keyof typeof ConfigKey]: any };
function makeConfig() {
    const _config = {};
    Object.values(ConfigKey).forEach((key) => {
        _config[key] = process.env?.[key];
    });
    const validateResult = validationSchema.validate(_config);
    if (validateResult?.error) {
        throw validateResult.error;
    }
    Object.assign(config, validateResult.value);
}

makeConfig();

export default config;
