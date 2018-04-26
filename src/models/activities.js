import { getActivities } from '../services/activities';

export default {
  namespace: 'activities',

  state: {
    list: [],
  },

  effects: {
    *fetchList(_, { call, put }) {
      const response = yield call(getActivities);
      yield put({
        type: 'saveList',
        payload: Array.isArray(response.results) ? response.results : [],
      });
    },
  },

  reducers: {
    saveList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
  },
};
