import { message } from 'antd';
import { getFile, postFile, putFile, deleteFile } from '../services/file';

export default {
  namespace: 'file',

  state: {
    file: {
      results: [],
    },
  },

  effects: {
    *fetchFile({ payload }, { call, put }) {
      const respon = yield call(getFile, payload);
      yield put({ type: 'queryFile', payload: respon });
    },
    *storeFile({ payload }, { call, put }) {
      const res = yield call(postFile, payload);
      if (res.error) {
        message.error(`保存文件日志失败！${res.error}`, 5);
      } else {
        yield put({ type: 'appendFile', payload: { ...payload, ...res } });
        // message.success('保存成功！', 3);
      }
    },
    *coverFile({ payload }, { call, put }) {
      const res = yield call(putFile, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'resetFile', payload: { ...payload, ...res } });
        // message.success('保存成功！', 3);
      }
    },
    *removeFile({ payload }, { call, put }) {
      const res = yield call(deleteFile, payload);
      if (res.error) {
        message.error(`删除失败！${res.error}`, 5);
      } else {
        yield put({ type: 'clearFile', payload: { ...payload } });
        message.success('删除成功！', 3);
      }
    },
    *trashFile(_, { put }) {
      yield put({ type: 'emptyFile' });
    },
  },

  reducers: {
    queryFile(state, action) {
      return {
        ...state,
        file: action.payload,
      };
    },
    appendFile(state, action) {
      return ({
        ...state,
        file: {
          results: state.file.results.concat(action.payload),
        },
      });
    },
    resetFile(state, action) {
      return ({
        ...state,
        file: {
          results: state.file.results.map((item) => {
            if (item.objectId === action.payload.objectId) {
              return { ...item, ...action.payload };
            } else {
              return item;
            }
          }),
        },
      });
    },
    clearFile(state, action) {
      return ({
        ...state,
        file: {
          results: state.file.results.filter(item => item.objectId !== action.payload.objectId),
        },
      });
    },
    emptyFile(state) {
      return ({
        ...state,
        file: {
          results: [],
        },
      });
    },
  },
};
