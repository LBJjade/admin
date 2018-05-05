/**
 * 定义整个项目的全局配置
 */

module.exports = {
  appName: 'Bee Pro',
  copyRight: {
    title: ' 2018 品清科技体验技术部出品',
    links: '',
  },

  // 对后端请求的相关配置
  api: {
    host: 'http://localhost:12345',
    port: '12345',
    path: '/api',
    timeout: 15000,
  },

  mail: {
    host: 'http://localhost:12345',
    port: '12345',
    path: '/mail',
    timeout: 15000,
  },
};