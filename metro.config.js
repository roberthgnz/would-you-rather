const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add pnpm support
config.resolver = {
  ...config.resolver,
  extraNodeModules: new Proxy(
    {},
    {
      get: (target, name) => {
        if (target.hasOwnProperty(name)) {
          return target[name];
        }
        return path.join(__dirname, `node_modules/${name}`);
      },
    }
  ),
  unstable_enableSymlinks: true,
  unstable_enablePackageExports: true,
};

// Add source map support
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    compress: {
      drop_console: false,
    },
  },
};

module.exports = config;