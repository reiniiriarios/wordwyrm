/** @type {import('stylelint').Config} */
export default {
  extends: "stylelint-config-standard-scss",
  customSyntax: "postcss-html",
  rules: {
    "selector-class-pattern": [
      "^(?:[a-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*(?:__[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)?(?:--[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)?)?(?:\\[.+\\])?$",
      {
        message: "Expected property name to be in BEM format",
        resolveNestedSelectors: true,
      },
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "export"],
      },
    ],
  },
};
