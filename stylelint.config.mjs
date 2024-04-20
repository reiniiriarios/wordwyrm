/** @type {import('stylelint').Config} */
export default {
  extends: "stylelint-config-standard-scss",
  customSyntax: "postcss-html",
  rules: {
    "selector-class-pattern": [
      "^[a-z](?:[_A-Za-z0-9]*[A-Za-z0-9]+)?$",
      {
        message: "Expected class selector to be camelCase with underscore",
      },
    ],
  },
};
