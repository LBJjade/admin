import { message } from 'antd';
import { getUsers, getUserMe, getVerifyEmail, putUser, getFunctionClientip } from '../services/account';
import { getNotices, putNotice } from '../services/notice';
import { deleteFile } from '../services/file';
import store from '../index';

export default {
  namespace: 'account',

  state: {
    list: [],
    loading: false,
    currentUser: {},
    verifyResult: [],
    existUsername: [],
    existEmail: [],
    existMobile: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(getUsers);
      yield put({
        type: 'save',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *fetchCurrent(_, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const resUser = yield call(getUserMe);
      if (resUser.error === undefined) {
        yield put({
          type: 'saveCurrentUser',
          payload: resUser,
        });
        const ip = yield call(getFunctionClientip);
        const dataTime = new Date().toISOString();
        const params = {
          objectId: resUser.objectId,
          loginIp: ip.result,
          loginDatetime: {
            __type: 'Date',
            iso: dataTime,
          },
        };
        yield call(putUser, params);
      } else {
        // 加载当前用户信息失败，重新登陆
        const { dispatch } = store;
        dispatch({ type: 'login/logout' });
        return;
      }
      // 仅加载当前用户消息。
      const resNotices = yield call(getNotices, {
        userId: resUser.objectId,
        clear: false,
      });
      yield put({
        type: 'changeNotifys',
        payload: resNotices,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *verifyEmail({ payload }, { call, put }) {
      const ret = yield call(getVerifyEmail, payload);
      yield put({
        type: 'changeVerifying',
        payload: ret,
      });
    },
    *noticeClear({ payload }, { call }) {
      yield call(putNotice, payload);
    },
    *noticeRead({ payload }, { call }) {
      yield call(putNotice, payload);
    },
    *existUsername({ payload }, { call, put }) {
      const existUser = yield call(getUsers, payload);
      yield put({
        type: 'changeUsername',
        payload: existUser,
      });
    },
    *existEmail({ payload }, { call, put }) {
      const existUser = yield call(getUsers, payload);
      yield put({
        type: 'changeEmail',
        payload: existUser,
      });
    },
    *existMobile({ payload }, { call, put }) {
      const existUser = yield call(getUsers, payload);
      yield put({
        type: 'changeMobile',
        payload: existUser,
      });
    },
    *coverUser({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const res = yield call(putUser, payload);
      if (res.error === undefined) {
        yield put({ type: 'resetUser', payload: { ...payload, ...res } });
        message.success('保存成功！', 3);
      } else {
        message.error(`保存失败！${res.error}`, 5);
      }
      yield put({ type: 'changeLoading', payload: false });
    },
    *removeFile({ payload }, { call }) {
      const res = yield call(deleteFile, payload);
      if (res.error) {
        message.error(`删除文件失败！${res.error}`, 10);
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    changeNotifys(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.count,
          notifys: action.payload.results,
        },
      };
    },
    changeVerifying(state, { payload }) {
      return {
        ...state,
        verifyResult: payload,
      };
    },
    changeUsername(state, { payload }) {
      return {
        ...state,
        existUsername: payload,
      };
    },
    changeEmail(state, { payload }) {
      return {
        ...state,
        existEmail: payload,
      };
    },
    changeMobile(state, { payload }) {
      return {
        ...state,
        existMobile: payload,
      };
    },
    resetUser(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          ...action.payload,
        },
      };
    },
  },
};
