import Rollbar from 'rollbar';

// Track error by rollbar.com
if (location.host === 'preview.pro.ant.design') {
  Rollbar.init({
    accessToken: '',
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
      environment: 'production',
    },
  });
}
