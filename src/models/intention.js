import { getIntention } from '../services/analysis';


export default {
  namespace: 'intention',

  state: {},

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(getIntention);
      yield put({
        type: 'show',
        payload: response,
      });
    },
  },

  reducers: {
    show(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
