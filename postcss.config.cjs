/* eslint-disable @typescript-eslint/no-require-imports */
const tailwindcss = require('tailwindcss');
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');

/** @type {import('postcss').Config} */
module.exports = {
  plugins: [
    tailwindcss(),
    postcssPresetEnv({
      stage: 1
    }),
    autoprefixer()
  ]
};
