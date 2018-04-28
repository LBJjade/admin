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
      target: 'https://parse-server-bee.herokuapp.com/',
      pathRewrite: { '^/api': 'parse' },
    },
    '/mail': {
      changeOrigin: true,
      target: 'https://parse-server-bee.herokuapp.com/',
      pathRewrite: { '^/mail': 'parse/apps/bee' },
    },
  },

};
