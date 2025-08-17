// This file must use CommonJS syntax because Vite treats it as a config file, not a module.
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
