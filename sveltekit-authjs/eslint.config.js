import js from '@eslint/js'
import ts from 'typescript-eslint'
import globals from 'globals'
import svelte from 'eslint-plugin-svelte' // when using svelte
import prettier from 'eslint-config-prettier' // when using prettier
// import stylistic from '@stylistic/eslint-plugin' // when not using prettier
// import tailwind from 'eslint-plugin-tailwindcss' // when not using prettier
// import react from 'eslint-plugin-react' // when using react
// import reactHooks from 'eslint-plugin-react-hooks' //when using react
// import next from '@next/eslint-plugin-next' // when using nextjs

export default ts.config(
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs['flat/recommended'], // when using svelte
    prettier, // when using prettier
    ...svelte.configs['flat/prettier'], // when using prettier
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                App: 'writable', // when using svelte
            },
        },
    },
    // when using svelte
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
            },
        },
    },
    // when using svelte and not using prettier
    // {
    //     files: ['**/*.svelte'],
    //     plugins: {
    //         svelte: svelte,
    //     },
    //     rules: {
    //         'svelte/html-quotes': ['error', { prefer: 'double' }],
    //         'svelte/max-attributes-per-line': [
    //             'error',
    //             {
    //                 multiline: 1,
    //                 singleline: 1,
    //             },
    //         ],
    //         'svelte/first-attribute-linebreak': [
    //             'error',
    //             {
    //                 multiline: 'below',
    //                 singleline: 'beside',
    //             },
    //         ],
    //     },
    // },
    {
        // plugins: {
        //     '@stylistic': stylistic,
        //     'react': react,
        //     'react-hooks': reactHooks,
        //     '@next/next': next,
        // },
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            // 'curly': ['error', 'all'],

            // '@stylistic/linebreak-style': ['error', 'unix'],
            // '@stylistic/semi': ['error', 'never'],
            // '@stylistic/indent': ['error', 4],
            // '@stylistic/quotes': ['error', 'single'],
            // '@stylistic/brace-style': ['error', '1tbs'],
            // '@stylistic/comma-dangle': ['error', 'only-multiline'],
            // '@stylistic/max-statements-per-line': ['error', { 'max': 1 }],

            // '@stylistic/array-bracket-spacing': ['error', 'never'],
            // '@stylistic/array-bracket-newline': ['error', 'consistent'],
            // '@stylistic/array-element-newline': ['error', 'consistent'],
            // '@stylistic/object-curly-spacing': ['error', 'always'],
            // '@stylistic/object-curly-newline': ['error', { 'consistent': true }],
            // '@stylistic/object-property-newline': ['error', { 'allowAllPropertiesOnSameLine': true }],

            // '@stylistic/jsx-indent': ['error', 4],
            // '@stylistic/jsx-indent-props': ['error', 4],
            // '@stylistic/jsx-curly-spacing': ['error', { 'when': 'never', 'children': { 'when': 'always' } }],
            // '@stylistic/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
            // '@stylistic/jsx-max-props-per-line': ['error', { 'maximum': { 'single': 2, 'multi': 1 } }],
            // '@stylistic/jsx-closing-bracket-location': ['error', 'tag-aligned'],
            // '@stylistic/jsx-closing-tag-location': 'error',

            // 'react/prop-types': 'off',

            // ...next.configs.recommended.rules,
            // ...next.configs['core-web-vitals'].rules,
            // '@next/next/no-img-element': 'error',
            // '@next/next/no-duplicate-head': 'off',
        },
    },
    {
        ignores: [
            '.fixtures/',
            '.DS_Store',
            'node_modules/',
            'build/',
            'dist/',
            '.svelte-kit/',
            '.next/',
            'package/',
            '.env',
            '.env.*',
            '!.env.example',
            'pnpm-lock.yaml',
            'package-lock.json',
            'yarn.lock',
            'bun.lockb',
        ],
    }
    // ...tailwind.configs['flat/recommended'], // when not using prettier
)
