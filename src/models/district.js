import { Message } from 'antd';
import { getDistrict, postDistrict, putDistrict, districtBatchDelete, deleteDistrict, districtRequireQuery, uploadLogo, getBrand, getRegion } from '../services/basic';

export default {
  namespace: 'district',

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
    districts: [],
    districtNos: [],
    newdata: {
      results: [],
    },
  },

  effects: {
    *fetchDistrict({ payload }, { call, put }) {
      const response = yield call(getDistrict, payload);
      yield put({
        type: 'changeDistricts',
        payload: response,
      });
    },
    *storeDistrict({ payload }, { call, put }) {
      const response = yield call(postDistrict, payload);
      yield put({
        type: 'appendDistricts',
        payload: { results: [Object.assign(payload, response)] },
      });
      Message.success('新增成功');
    },
    *coverDistrict({ payload }, { call }) {
      const response = yield call(putDistrict, payload);
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
    *removeDistrict({ payload }, { call }) {
      const response = yield call(deleteDistrict, payload);
      if (JSON.parse(response).error === undefined) {
        Message.success('删除成功');
      } else {
        Message.error('删除失败');
      }
    },
    *batchRemoveDelete({ payload }, { call, put }) {
      const response = yield call(districtBatchDelete, payload);
      yield put({
        type: 'changeDistricts',
        payload: response,
      });
    },
    *requireQuery({ payload }, { call, put }) {
      const response = yield call(districtRequireQuery, payload);
      yield put({
        type: 'changeDistricts',
        payload: response,
      });
    },
    *upload({ payload }, { call, put }) {
      const response = yield call(uploadLogo, payload);
      yield put({
        type: 'changeDistricts',
        payload: response,
      });
    },
    *exisDistricts({ payload }, { call, put }) {
      const response = yield call(districtRequireQuery, payload);
      yield put({
        type: 'districts',
        payload: response,
      });
    },
    *exisDistrictNos({ payload }, { call, put }) {
      const response = yield call(districtRequireQuery, payload);
      yield put({
        type: 'districtNos',
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
  },

  reducers: {
    changeDistricts(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    appendDistricts(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.concat(action.payload.results),
          count: state.data.count + 1,
        },
      };
    },
    clearDistricts(state, action) {
      return {
        ...state,
        data: {
          results: state.data.results.filter(item => item.objectId !== action.payload),
          count: state.data.count - 1,
        },
      };
    },
    districts(state, action) {
      return {
        ...state,
        districts: action.payload,
      };
    },
    districtNos(state, action) {
      return {
        ...state,
        districtNos: action.payload,
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
  },
};
