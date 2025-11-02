import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import tailwindcss from 'tailwindcss';

export default {
  plugins: [
    tailwindcss(),
    postcssPresetEnv({
      stage: 1
    }),
    autoprefixer()
  ]
};
