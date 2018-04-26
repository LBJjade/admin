import { Message } from 'antd';
import { getBrand, postBrand, putBrand, brandBatchDelete, deleteBrand, brandRequireQuery, uploadLogo } from '../services/basic';

export default {
  namespace: 'brand',

  state: {
    data: {
      results: [],
      count: 0,
      state: [],
    },
    list: {
      results: [],
    },
    brands: [],
    brandNos: [],
  },

  effects: {
    *fetchBrand({ payload }, { call, put }) {
      const response = yield call(getBrand, payload);
      yield put({
        type: 'changeBrands',
        payload: response,
      });
    },
    *storeBrand({ payload }, { call }) {
      yield call(postBrand, payload);
      Message.success('新增成功');
    },
    *coverBrand({ payload }, { call }) {
      const response = yield call(putBrand, payload);
      if (response !== undefined) {
        if (JSON.parse(response).error === undefined) {
          Message.success('编辑成功');
        } else {
          Message.error('编辑失败');
        }
      } else {
        Message.success('编辑成功');
      }
    },
    *removeBrand({ payload }, { call }) {
      const response = yield call(deleteBrand, payload);
      if (JSON.parse(response).error === undefined) {
        Message.success('删除成功');
      } else {
        Message.error('删除失败');
      }
    },
    *batchRemoveDelete({ payload }, { call, put }) {
      const response = yield call(brandBatchDelete, payload);
      yield put({
        type: 'changeBrands',
        payload: response,
      });
    },
    *requireQuery({ payload }, { call, put }) {
      const response = yield call(brandRequireQuery, payload);
      yield put({
        type: 'changeBrands',
        payload: response,
      });
    },
    *upload({ payload }, { call, put }) {
      const response = yield call(uploadLogo, payload);
      yield put({
        type: 'changeBrands',
        payload: response,
      });
    },
    *exisBrands({ payload }, { call, put }) {
      const response = yield call(brandRequireQuery, payload);
      yield put({
        type: 'brands',
        payload: response,
      });
    },
    *exisBrandNos({ payload }, { call, put }) {
      const response = yield call(brandRequireQuery, payload);
      yield put({
        type: 'brandNos',
        payload: response,
      });
    },
  },

  reducers: {
    changeBrands(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    appendBrands(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.concat(action.payload.results),
          count: state.data.count + 1,
        },
      };
    },
    resetBrands(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.map((item) => {
            if (item.objectId === action.payload.ojId) {
              return action.payload;
            } else {
              return item;
            }
          }),
          count: state.data.count,
        },
      };
    },
    clearBrands(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.filter(item => item.objectId !== action.payload),
          count: state.data.count - 1,
        },
      };
    },
    brands(state, action) {
      return {
        ...state,
        brands: action.payload,
      };
    },
    brandNos(state, action) {
      return {
        ...state,
        brandNos: action.payload,
      };
    },
  },
};
