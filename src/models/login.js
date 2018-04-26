import { routerRedux } from 'dva/router';
import { Message } from 'antd';
import { getLogin, putUser, getFunctionClientip } from '../services/account';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(getLogin, payload);
      // Login successfully
      if (response.error === undefined) {
        if (response.sessionToken !== undefined) {
          if (response.emailVerified) {
            yield put({
              type: 'changeLoginStatus',
              payload: { ...response, currentAuthority: 'admin' },
            });
            localStorage.token = response.sessionToken;
            localStorage.currentUserId = response.objectId;
            reloadAuthorized();
            const ip = yield call(getFunctionClientip);
            const dataTime = new Date().toISOString();
            const params = {
              objectId: response.objectId,
              loginIp: ip.result,
              loginDatetime: {
                __type: 'Date',
                iso: dataTime,
              },
            };
            yield call(putUser, params);
            yield put(routerRedux.push('/'));
          } else {
            Message.error('登录失败！帐号未验证！', 5);
          }
        } else {
          Message.error('登录失败！无法获取Token！', 5);
        }
      } else {
        Message.error(`登录失败！${response.error}`, 5);
      }
    },
    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/account/login'));
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
