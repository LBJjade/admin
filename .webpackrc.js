const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    'transform-decorators-legacy',
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  disableDynamicImport: true,
  publicPath: '/',
  hash: true,
  proxy: {
    '/api': {
      changeOrigin: true,
      target: 'http://becheer.com:1338/',
      pathRewrite: { '^/api': 'parse' },
    },
    '/mail': {
      changeOrigin: true,
      target: 'http://becheer.com:1338/',
      pathRewrite: { '^/mail': 'parse/apps/bee' },
    },
  },

};
