/* eslint-disable no-dupe-keys */
import { getUser } from '../services/user';

export default {
  namespace: 'user',

  state: {
    data: {
      results: [],
      count: 0,
    },
    dataAll: {
      results: [],
      count: 0,
    },
    dataCreate: {
      results: [],
      count: 0,
    },
    dataLogin: {
      results: [],
      count: 0,
    },
  },

  effects: {
    *fetchUser({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      yield put({
        type: 'changeUser',
        payload: response,
      });
    },
    *fetchUserByAll({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      yield put({
        type: 'changeUserByAll',
        payload: response,
      });
    },
    *fetchUserByCreate({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      yield put({
        type: 'changeUserByCreate',
        payload: response,
      });
    },
    *fetchUserByLogin({ payload }, { call, put }) {
      const response = yield call(getUser, payload);
      yield put({
        type: 'changeUserByLogin',
        payload: response,
      });
    },
  },

  reducers: {
    changeUser(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    changeUserByAll(state, action) {
      return {
        ...state,
        dataAll: action.payload,
      };
    },
    changeUserByCreate(state, action) {
      return {
        ...state,
        dataCreate: action.payload,
      };
    },
    changeUserByLogin(state, action) {
      return {
        ...state,
        dataLogin: action.payload,
      };
    },
  },
};
