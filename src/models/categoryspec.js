import { message } from 'antd';
import { getCategorySpec, postCategorySpec, putCategorySpec, deleteCategorySpec } from '../services/goods';

export default {
  namespace: 'categoryspec',

  state: {
    loading: false,
    data: {
      results: [],
      count: 0,
    },
  },

  effects: {
    *fetchCategorySpec({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const res = yield call(getCategorySpec, payload);
      yield put({ type: 'changeCategorySpec', payload: res });
      yield put({ type: 'changeLoading', payload: false });
    },

    *storeCategorySpec({ payload }, { call, put }) {
      const res = yield call(postCategorySpec, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'appendCategorySpec', payload: { ...payload, ...res } });
        message.success('保存成功！', 3);
      }
    },

    *coverCategorySpec({ payload }, { call, put }) {
      const res = yield call(putCategorySpec, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'resetCategorySpec', payload: { ...payload, ...res } });
        // message.success('保存成功！', 3);
      }
    },

    *removeCategorySpec({ payload }, { call, put }) {
      const res = yield call(deleteCategorySpec, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'clearCategorySpec', payload: { ...payload } });
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
    changeCategorySpec(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    appendCategorySpec(state, action) {
      return ({
        ...state,
        data: {
          results: state.data.results.concat(action.payload).sort(),
          count: state.data.count + 1,
        },
      });
    },
    resetCategorySpec(state, action) {
      return ({
        ...state,
        data: {
          results: state.data.results.map((item) => {
            if (item.objectId === action.payload.objectId) {
              return { ...item, ...action.payload };
            } else {
              return item;
            }
          }),
        },
      });
    },
    clearCategorySpec(state, action) {
      return ({
        ...state,
        data: {
          results: state.data.results.filter(item => item.objectId !== action.payload.objectId),
          count: state.data.count - 1,
        },
      });
    },
  },
};
