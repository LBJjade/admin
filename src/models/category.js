import { message } from 'antd';
import { getCategory, postCategory, putCategory, deleteCategory } from '../services/goods';
import { deleteFileStorage } from '../services/file';

export default {
  namespace: 'category',

  state: {
    loading: false,
    category: {
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

    *fetchCategorySpec({ payload }, { call, put }) {
      const res = yield call(getCategorySpec, payload);
      yield put({ type: 'changeCategorySpec', payload: res });
    },

    *storeCategory({ payload }, { call, put }) {
      const res = yield call(postCategory, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'appendCategory', payload: { ...payload, ...res } });
        message.success('保存成功！', 3);
      }
    },

    *coverCategory({ payload }, { call, put }) {
      const res = yield call(putCategory, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'resetCategory', payload: { ...payload, ...res } });
        // message.success('保存成功！', 3);
      }
    },

    *removeCategory({ payload }, { call, put }) {
      const res = yield call(deleteCategory, payload);
      if (res.error) {
        message.error(`删除失败！${res.error}`, 5);
      } else {
        yield put({ type: 'clearCategory', payload: { ...payload } });
        message.success('删除成功！', 3);
      }
    },

    *removeFile({ payload }, { call }) {
      const res = yield call(deleteFileStorage, payload);
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
        category: action.payload,
      };
    },
    changeCategorySpec(state, action) {
      return {
        ...state,
        CategorySpec: action.payload,
      };
    },
    appendCategory(state, action) {
      return ({
        ...state,
        category: {
          results: state.category.results.concat(action.payload).sort(),
          count: state.category.count + 1,
        },
      });
    },
    resetCategory(state, action) {
      return ({
        ...state,
        category: {
          results: state.category.results.map((item) => {
            if (item.objectId === action.payload.objectId) {
              return { ...item, ...action.payload };
            } else {
              return item;
            }
          }),
        },
      });
    },
    clearCategory(state, action) {
      return ({
        ...state,
        category: {
          results: state.category.results.filter(item => item.objectId !== action.payload.objectId),
          count: state.category.count - 1,
        },
      });
    },
  },
};
