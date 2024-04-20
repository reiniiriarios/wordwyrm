export default {
  /** @type {import('@typescript-eslint/utils').TSESLint.SharedConfig.RulesRecord} */
  tsRules: {
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
    "no-useless-escape": "off",
  },
};
