import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { getUsers, postUser, putUser, postRequestPasswordReset } from '../services/account';

export default {
  namespace: 'forgetpassword',

  state: {
    userValidating: [],
    email: '',
    existEmail: [],
  },

  effects: {
    *validate({ payload }, { call, put }) {
      const ret = yield call(getUsers, payload);
      yield put({
        type: 'changeValidating',
        payload: ret,
      });
    },

    *submitEmail({ payload }, { call, put }) {
      yield put({ type: 'saveStepFormData', payload });
      yield put({ type: 'changeSubmitting', payload: true });
      const resUser = yield call(getUsers, payload);
      if (resUser.error !== undefined) {
        message.error(`帐户邮箱不存在。${resUser.error}`, 3);
      } else {
        const resReset = yield call(postRequestPasswordReset, payload);
        if (resReset.error !== undefined) {
          message.error(`重置密码验证邮件发送失败！${resReset.error}`, 5);
        } else {
          message.success('已发送请求重置密码邮件至帐户邮箱，请开启邮箱并进行重置密码。', 5);
        }
      }
      yield put({ type: 'changeSubmitting', payload: false });
    },
    *submitPasswordReset({ payload }, { call, put }) {
      yield put({ type: 'changeSubmitting', payload: true });
      const resUser = yield call(getUsers, { objectId: payload.objectid });
      if (resUser.error !== undefined) {
        message.error(`帐户邮箱不存在。${resUser.error}`, 5);
      } else {
        const ret = yield call(putUser, payload);
        if (ret.error === undefined) {
          message.success('密码重置成功！', 5);
          yield put(routerRedux.push('/account/forgetpassword/result'));
        } else {
          message.error(`密码重置失败！${ret.error}`, 5);
        }
      }
      yield put({ type: 'changeSubmitting', payload: false });
    },
    *submitStepForm({ payload }, { call, put }) {
      yield call(postUser, payload);
      yield put({
        type: 'saveStepFormData',
        payload,
      });
      yield put(routerRedux.push('/account/forgetpassword/result'));
    },
    *existEmail({ payload }, { call, put }) {
      const existUser = yield call(getUsers, payload);
      yield put({
        type: 'changeEmail',
        payload: existUser,
      });
    },
  },

  reducers: {
    changeValidating(state, { payload }) {
      return {
        ...state,
        userValidating: payload,
      };
    },
    handleReset(state, { payload }) {
      return {
        ...state,
        res: payload,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
    saveStepFormData(state, { payload }) {
      return {
        ...state,
        payload,
      };
    },
    changeEmail(state, { payload }) {
      return {
        ...state,
        existEmail: payload,
      };
    },
  },
};
