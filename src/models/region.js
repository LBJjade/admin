import { Message } from 'antd';
import { getRegion, postRegion, putRegion, deleteRegion, regionRequireQuery, uploadLogo, getBrand } from '../services/basic';

export default {
  namespace: 'region',

  state: {
    data: {
      results: [],
      count: 0,
      state: [],
    },
    list: {
      results: [],
    },
    brands: {
      results: [],
    },
    regions: [],
    regionNos: [],
    newdata: {
      results: [],
    },
  },

  effects: {
    *fetchRegion({ payload }, { call, put }) {
      const response = yield call(getRegion, payload);
      yield put({
        type: 'changeRegions',
        payload: response,
      });
    },
    *storeRegion({ payload }, { call, put }) {
      const response = yield call(postRegion, payload);
      yield put({
        type: 'appendRegions',
        payload: { results: [Object.assign(payload, response)] },
      });
      Message.success('新增成功');
    },
    *coverRegion({ payload }, { call }) {
      const response = yield call(putRegion, payload);
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
    *removeRegion({ payload }, { call }) {
      const response = yield call(deleteRegion, payload);
      if (JSON.parse(response).error === undefined) {
        Message.success('删除成功');
      } else {
        Message.error('删除失败');
      }
    },
    *requireQuery({ payload }, { call, put }) {
      const response = yield call(regionRequireQuery, payload);
      yield put({
        type: 'changeRegions',
        payload: response,
      });
    },
    *upload({ payload }, { call, put }) {
      const response = yield call(uploadLogo, payload);
      yield put({
        type: 'changeRegions',
        payload: response,
      });
    },
    *exisRegions({ payload }, { call, put }) {
      const response = yield call(regionRequireQuery, payload);
      yield put({
        type: 'regions',
        payload: response,
      });
    },
    *exisRegionNos({ payload }, { call, put }) {
      const response = yield call(regionRequireQuery, payload);
      yield put({
        type: 'regionNos',
        payload: response,
      });
    },
    *getBrands({ payload }, { call, put }) {
      const response = yield call(getBrand, payload);
      yield put({
        type: 'hadBrands',
        payload: response,
      });
    },
  },

  reducers: {
    changeRegions(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    appendRegions(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.concat(action.payload.results),
          count: state.data.count + 1,
        },
      };
    },
    resetRegions(state, action) {
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
    clearRegions(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.filter(item => item.objectId !== action.payload),
          count: state.data.count - 1,
        },
      };
    },
    regions(state, action) {
      return {
        ...state,
        regions: action.payload,
      };
    },
    regionNos(state, action) {
      return {
        ...state,
        regionNos: action.payload,
      };
    },
    hadBrands(state, action) {
      return {
        ...state,
        brands: action.payload,
      };
    },
  },
};
