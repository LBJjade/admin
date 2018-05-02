import { getCategory } from '../services/goods';

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
  },
};
