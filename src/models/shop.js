/* eslint-disable keyword-spacing,no-undef,no-unused-vars,no-unreachable,arrow-parens,object-shorthand,max-len */
import { Message } from 'antd';
import { getShop, postShop, putShop, shopBatchDelete, deleteShop, shopRequireQuery, uploadLogo, getBrand, getRegion, getDistrict } from '../services/basic';

export default {
  namespace: 'shop',

  state: {
    data: {
      results: [],
      count: 0,
      state: [],
    },
    brands: {
      results: [],
    },
    regions: {
      results: [],
    },
    districts: {
      results: [],
    },
    shops: [],
    shopNos: [],
    newdata: {
      results: [],
    },
  },

  effects: {
    *fetchShop({ payload }, { call, put }) {
      const response = yield call(getShop, payload);
      yield put({
        type: 'changeShops',
        payload: response,
      });
    },
    *storeShop({ payload }, { call, put }) {
      const response = yield call(postShop, payload);
      yield put({
        type: 'appendShops',
        payload: { results: [Object.assign(payload, response)] },
      });
      Message.success('新增成功');
    },
    *coverShop({ payload }, { call, put }) {
      const response = yield call(putShop, payload);
      if(response !== undefined) {
        if(JSON.parse(response).error === undefined) {
          Message.success('编辑成功');
        }else{
          Message.error('编辑失败');
        }
      }else{
        Message.success('编辑成功');
      }
    },
    *removeShop({ payload }, { call, put }) {
      const response = yield call(deleteShop, payload);
      if(JSON.parse(response).error === undefined) {
        Message.success('删除成功');
      }else{
        Message.error('删除失败');
      }
    },
    *batchRemoveDelete({ payload }, { call, put }) {
      const response = yield call(shopBatchDelete, payload);
      yield put({
        type: 'changeShops',
        payload: response,
      });
    },
    *requireQuery({ payload }, { call, put }) {
      const response = yield call(shopRequireQuery, payload);
      yield put({
        type: 'changeShops',
        payload: response,
      });
    },
    *upload({ payload }, { call, put }) {
      const response = yield call(uploadLogo, payload);
      yield put({
        type: 'changeShops',
        payload: response,
      });
    },
    *exisShops({ payload }, { call, put }) {
      const response = yield call(shopRequireQuery, payload);
      yield put({
        type: 'shops',
        payload: response,
      });
    },
    *exisShopNos({ payload }, { call, put }) {
      const response = yield call(shopRequireQuery, payload);
      yield put({
        type: 'shopNos',
        payload: response,
      });
    },
    *getBrands({ payload }, { call, put }) {
      const response = yield call(getBrand, payload);
      yield put({
        type: 'haveBrands',
        payload: response,
      });
    },
    *getRegions({ payload }, { call, put }) {
      const response = yield call(getRegion, payload);
      yield put({
        type: 'haveRegions',
        payload: response,
      });
    },
    *getDistricts({ payload }, { call, put }) {
      const response = yield call(getDistrict, payload);
      yield put({
        type: 'haveDistricts',
        payload: response,
      });
    },
  },
  reducers: {
    changeShops(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    appendShops(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.concat(action.payload.results),
          count: state.data.count + 1,
        },
      };
    },
    resetShops(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.map(item => {
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
    clearShops(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.filter(item => item.objectId !== action.payload),
          count: state.data.count - 1,
        },
      };
    },
    shops(state, action) {
      return {
        ...state,
        shops: action.payload,
      };
    },
    shopNos(state, action) {
      return {
        ...state,
        shopNos: action.payload,
      };
    },
    haveBrands(state, action) {
      return {
        ...state,
        brands: action.payload,
      };
    },
    haveRegions(state, action) {
      return {
        ...state,
        regions: action.payload,
      };
    },
    haveDistricts(state, action) {
      return {
        ...state,
        districts: action.payload,
      };
    },
  },
};
