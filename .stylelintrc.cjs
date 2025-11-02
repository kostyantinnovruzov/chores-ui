module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    }
  ],
  rules: {
    'selector-class-pattern': null,
    'at-rule-no-unknown': null,
    'no-invalid-position-at-import-rule': null
  }
};
