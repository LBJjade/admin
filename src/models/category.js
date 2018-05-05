import { message } from 'antd';
import { getCategory, putCategory } from '../services/goods';
import { deleteFile } from '../services/file';

export default {
  namespace: 'category',

  state: {
    loading: false,
    dataCategory: {
      results: [],
      count: 0,
    },
  },

  effects: {
    *fetchCategory({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const res = yield call(getCategory, payload);
      yield put({ type: 'changeCategory', payload: res });
      yield put({ type: 'changeLoading', payload: false });
    },

    *coverCategory({ payload }, { call, put }) {
      const res = yield call(putCategory, payload);
      if (res.error === undefined) {
        yield put({ type: 'resetCategory', payload: { ...payload, ...res } });
        message.success('保存成功！', 3);
      } else {
        message.error(`保存失败！${res.error}`, 5);
      }
    },
    *removeFile({ payload }, { call }) {
      const res = yield call(deleteFile, payload);
      if (res.error) {
        message.error(`删除文件失败！${res.error}`, 10);
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
    changeCategory(state, action) {
      return {
        ...state,
        dataCategory: action.payload,
      };
    },
    resetCategory(state, action) {
      return {
        ...state,
        dataCategory: {
          ...action.payload,
        },
      };
    },

  },
};
