// @ts-check
import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginSvelte from "eslint-plugin-svelte";
import eslintConfigPrettier from "eslint-config-prettier";
import svelteParser from "svelte-eslint-parser";

export default tseslint.config(
  {
    files: ["frontend/**/*.svelte"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...eslintPluginSvelte.configs["flat/recommended"],
      eslintConfigPrettier,
      ...eslintPluginSvelte.configs["flat/prettier"],
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        extraFileExtensions: [".svelte"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-multi-spaces": [
        "error",
        {
          ignoreEOLComments: true,
          exceptions: {
            VariableDeclarator: true,
          },
        },
      ],
      "block-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "space-in-parens": ["error", "never"],
      "comma-spacing": [
        "error",
        {
          before: false,
          after: true,
        },
      ],
      "key-spacing": [
        "error",
        {
          afterColon: true,
          beforeColon: false,
        },
      ],
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      semi: ["error", "always"],
      "no-console": ["warn"],
      "no-constant-condition": ["warn"],
      curly: ["error", "all"],
      "brace-style": [
        "error",
        "1tbs",
        {
          allowSingleLine: false,
        },
      ],
      "keyword-spacing": [
        "error",
        {
          before: true,
          after: true,
        },
      ],
      "object-curly-spacing": ["error", "always"],
      "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
      "spaced-comment": [2, "always"],
      "space-before-blocks": ["error", "always"],
      "space-before-function-paren": "off",
      "prefer-template": "error",
      "no-useless-concat": "error",
      // "linebreak-style": ["error", "unix"],
      "eol-last": ["error", "always"],
      "template-curly-spacing": ["error", "never"],
      "no-control-regex": "off",
      "no-extra-boolean-cast": "off",
    },
  },
  {
    files: ["frontend/**/*.ts"],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-multi-spaces": [
        "error",
        {
          ignoreEOLComments: true,
          exceptions: {
            VariableDeclarator: true,
          },
        },
      ],
      "block-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "space-in-parens": ["error", "never"],
      "comma-spacing": [
        "error",
        {
          before: false,
          after: true,
        },
      ],
      "key-spacing": [
        "error",
        {
          afterColon: true,
          beforeColon: false,
        },
      ],
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      semi: ["error", "always"],
      "no-console": ["warn"],
      "no-constant-condition": ["warn"],
      curly: ["error", "all"],
      "brace-style": [
        "error",
        "1tbs",
        {
          allowSingleLine: false,
        },
      ],
      "keyword-spacing": [
        "error",
        {
          before: true,
          after: true,
        },
      ],
      "object-curly-spacing": ["error", "always"],
      "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
      "spaced-comment": [2, "always"],
      "space-before-blocks": ["error", "always"],
      "space-before-function-paren": "off",
      "prefer-template": "error",
      "no-useless-concat": "error",
      "linebreak-style": ["error", "unix"],
      "eol-last": ["error", "always"],
      "template-curly-spacing": ["error", "never"],
      "no-control-regex": "off",
      "no-extra-boolean-cast": "off",
    },
  },
  {
    ignores: ["build/", "dist/", "electron/", "rollup.config.mjs"],
  },
);
