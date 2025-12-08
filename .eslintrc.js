module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-restricted-syntax': [
            'error',
            {
                selector:
                    'VariableDeclarator > Literal[value=/^[a-zA-Z0-9]+$/][raw!=/^[0-9]+$/]',
                message:
                    'Magic strings are not allowed in variable declarations. Use constants instead.',
            },
        ],
    },
    overrides: [
        {
            files: [
                'test/**/*',
                '**/*.test.js',
                '**/*.spec.js',
                '**/*.test.ts',
                '**/*.spec.ts',
                '**/*.swagger.ts',
                '**/*.dto.ts',
                '**/*.validator.ts',
                '**/constants.ts',
                '**/*.constants.ts',
                '**/constants/*.ts',
            ],
            rules: {
                'no-restricted-syntax': 'off', // Turn off the magic string rule for these files
            },
        },
    ],
};
