import { getCity } from "../services/city";


export default {
  namespace: 'city',
  state: {
    loading: false,
    data: {
      results: [],
      count: 0,
    },
  },
  effects: {
    *fetchCity({ payload }, { call, put }) {
      const res = yield call(getCity, payload);
      yield put({ type: 'changeCity', payload: res, });
    },
  },
  reducers: {
    changeCity(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
}

