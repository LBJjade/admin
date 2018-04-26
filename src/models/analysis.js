import { message } from 'antd';
import {
  getIntention,
  getAnalysisField,
  getAnalysisRule,
  postAnalysisRule,
  putAnalysisRule,
  deleteAnalysisRule } from '../services/analysis';

export default {
  namespace: 'analysis',

  state: {
    loading: false,
    intention: {
      results: [],
    },
    analysisField: {
      results: [],
    },
    analysisRule: {
      results: [],
    },
  },

  effects: {
    // *fetch(_, { call, put }) {
    //   yield put({ type: 'changeLoading', payload: true });
    //   const response = call(getIntention);
    //   yield put({ type: 'changeIntention', payload: response });
    //   yield put({ type: 'changeLoading', payload: false });
    // },
    *fetchIntention({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const response = yield call(getIntention, payload);
      if (response.error === undefined) {
        yield put({ type: 'changeIntention', payload: response });
      } else {
        message.error(`获取数据失败！${response.error}`);
      }
      yield put({ type: 'changeLoading', payload: false });
    },
    *fetchAnalysisField({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const resField = yield call(getAnalysisField, payload);
      yield put({ type: 'changeAnalysisField', payload: resField });
      yield put({ type: 'changeLoading', payload: false });
    },
    *fetchAnalysisRule({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const resRule = yield call(getAnalysisRule, payload);
      yield put({ type: 'changeAnalysisRule', payload: resRule });
      yield put({ type: 'changeLoading', payload: false });
    },
    *storeAnalysisRule({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const res = yield call(postAnalysisRule, payload);
      if (res.error === undefined) {
        yield put({ type: 'appendAnalysisRule', payload: { results: [Object.assign(payload, res)] } });
        message.success('保存成功！', 3);
      } else {
        message.error(`保存失败！${res.error}`, 5);
      }
      yield put({ type: 'changeLoading', payload: false });
    },
    *coverAnalysisRule({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const res = yield call(putAnalysisRule, payload);
      if (res.error === undefined) {
        yield put({ type: 'resetAnalysisRule', payload: { ...payload } });
        message.success('保存成功！', 3);
      } else {
        message.error(`保存失败！${res.error}`, 5);
      }
      yield put({ type: 'changeLoading', payload: false });
    },
    *removeAnalysisRule({ payload }, { call, put }) {
      yield put({ type: 'changeLoading', payload: true });
      const res = yield call(deleteAnalysisRule, payload);
      if (res.error === undefined) {
        yield put({ type: 'clearAnalysisRule', payload: { ...payload } });
        message.success('删除成功！', 3);
      } else {
        message.error(`删除失败！${res.error}`, 5);
      }
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
    changeIntention(state, action) {
      return {
        ...state,
        intention: action.payload,
      };
    },
    changeAnalysisField(state, action) {
      return {
        ...state,
        analysisField: action.payload,
      };
    },
    changeAnalysisRule(state, action) {
      return {
        ...state,
        analysisRule: action.payload,
      };
    },
    appendAnalysisRule(state, action) {
      return {
        ...state,
        analysisRule: {
          results: state.analysisRule.results.concat(action.payload.results),
        },
      };
    },
    resetAnalysisRule(state, action) {
      return {
        ...state,
        analysisRule: {
          results: state.analysisRule.results.map((item) => {
            if (item.objectId === action.payload.objectId) {
              return action.payload;
            } else {
              return item;
            }
          }),
        },
      };
    },
    clearAnalysisRule(state, action) {
      return {
        ...state,
        analysisRule: {
          results:
            state.analysisRule.results.filter(item => item.objectId !== action.payload.objectId),
        },
      };
    },
  },
};
