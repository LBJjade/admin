import { message } from 'antd';
import { getSpec, postSpec, putSpec, deleteSpec } from '../services/goods';
import { deleteFile } from '../services/file';

export default {
  namespace: 'spec',

  state: {
    loading: false,
    spec: {
      results: [],
      count: 0,
    },
  },

  effects: {
    *fetchSpec({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const res = yield call(getSpec, payload);
      yield put({ type: 'changeSpec', payload: res });
      yield put({ type: 'changeLoading', payload: false });
    },

    *storeSpec({ payload }, { call, put }) {
      const res = yield call(postSpec, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'appendSpec', payload: { ...payload, ...res } });
        message.success('保存成功！', 3);
      }
    },

    *coverSpec({ payload }, { call, put }) {
      const res = yield call(putSpec, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'resetSpec', payload: { ...payload, ...res } });
        // message.success('保存成功！', 3);
      }
    },

    *removeSpec({ payload }, { call, put }) {
      const res = yield call(deleteSpec, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'clearSpec', payload: { ...payload } });
      }
    },
  },

  reducers: {
    changeLoading(state, { payload }) {
      return {
        ...state,
        loading: payload,
      };
    },
    changeSpec(state, action) {
      return {
        ...state,
        spec: action.payload,
      };
    },
    appendSpec(state, action) {
      return ({
        ...state,
        spec: {
          results: state.spec.results.concat(action.payload).sort(),
          count: state.spec.count + 1,
        },
      });
    },
    resetSpec(state, action) {
      return ({
        ...state,
        spec: {
          results: state.spec.results.map((item) => {
            if (item.objectId === action.payload.objectId) {
              return { ...item, ...action.payload };
            } else {
              return item;
            }
          }),
        },
      });
    },
    clearSpec(state, action) {
      return ({
        ...state,
        spec: {
          results: state.spec.results.filter(item => item.objectId !== action.payload.objectId),
          count: state.spec.count - 1,
        },
      });
    },
  },
};
