// @ts-check
import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginSvelte from "eslint-plugin-svelte";
import eslintConfigPrettier from "eslint-config-prettier";
import svelteParser from "svelte-eslint-parser";
import customRules from "./eslint.rules.mjs";

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
    rules: customRules.tsRules,
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
    rules: customRules.tsRules,
  },
  {
    files: ["electron/**/*.ts"],
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
        project: "electron/tsconfig.json",
      },
    },
    rules: customRules.tsRules,
  },
  {
    files: ["test/**/*.ts"],
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
        project: "test/tsconfig.json",
      },
    },
    rules: {
      ...customRules.tsRules,
      "no-console": "warn",
    },
  },
  {
    ignores: ["build/", "dist/", "rollup.config.mjs"],
  },
);
