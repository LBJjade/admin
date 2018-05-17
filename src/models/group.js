/* eslint-disable object-curly-spacing */
import {message} from 'antd';
import {getGroup, postGroup, putGroup, deleteGroup} from '../services/goods';

export default {
  namespace: 'group',

  state: {
    group: {
      results: [],
      count: 0,
    },
  },

  effects: {
    // Group
    * fetchGroup({payload}, {call, put}) {
      const respon = yield call(getGroup, payload);
      yield put({type: 'queryGroup', payload: respon});
    },
    * storeGroup({payload}, {call, put}) {
      const respon = yield call(postGroup, payload);
      if (respon.error) {
        message.error(`保存失败！${respon.error}`, 5);
      } else {
        yield put({type: 'appendGroup', payload: {...payload, ...respon}});
        message.success('保存成功！', 3);
      }
    },
    * coverGroup({payload}, {call, put}) {
      const respon = yield call(putGroup, payload);
      if (respon.error) {
        message.error(`保存失败！${respon.error}`, 5);
      } else {
        yield put({type: 'resetGroup', payload: {...payload, ...respon}});
        // message.success('保存成功！', 3);
      }
    },
    * removeGroup({payload}, {call, put}) {
      const respon = yield call(deleteGroup, payload);
      if (respon.error) {
        message.error(`删除失败！${respon.error}`, 5);
      } else {
        yield put({type: 'clearGroup', payload: {...payload}});
        message.success('删除成功！', 3);
      }
    },
  },

  reducers: {
    // Group:
    queryGroup(state, action) {
      return {
        ...state,
        group: action.payload,
      };
    },
    appendGroup(state, action) {
      return ({
        ...state,
        group: {
          results: state.group.results.concat(action.payload),
          count: state.group.count + 1,
        },
      });
    },
    resetGroup(state, action) {
      return ({
        ...state,
        group: {
          results: state.group.results.map((item) => {
            if (item.objectId === action.payload.objectId) {
              return {...item, ...action.payload};
            } else {
              return item;
            }
          }),
        },
      });
    },
    clearGroup(state, action) {
      return ({
        ...state,
        group: {
          results: state.group.results.filter(item => item.objectId !== action.payload.objectId),
          count: state.group.count - 1,
        },
      });
    },
  },
};
