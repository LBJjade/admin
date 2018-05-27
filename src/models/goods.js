import { message } from 'antd';
import { getGoodses, getGoods, postGoods, putGoods, deleteGoods, getGoodsImage, postGoodsImage, deleteGoodsImage } from '../services/goods';

export default {
  namespace: 'goods',

  state: {
    goodses: {
      results: [],
      count: 0,
    },
    goods: undefined,
  },

  effects: {
    // goodses
    *fetchGoodses({ payload }, { call, put }) {
      const respon = yield call(getGoodses, payload);
      yield put({ type: 'queryGoodses', payload: respon });
    },

    // goods
    *fetchGoods({ payload }, { call, put }) {
      // Get Goods
      const respon = yield call(getGoods, payload);
      yield put({ type: 'queryGoods', payload: respon });

      // Get GoodsImage
      // yield put({ type: 'emptyGoodsImage' });
      // if (payload.objectId) {
      //   const goodsImagewhere = {
      //     where: {
      //       pointerGoods: { __type: 'Pointer', className: 'Goods', objectId: payload.objectId },
      //     },
      //   };
      //   const respon2 = yield call(getGoodsImage, goodsImagewhere);
      //   yield put({ type: 'queryGoodsImage', payload: respon2 });
      // }
    },
    *storeGoods({ payload }, { call, put }) {
      const res = yield call(postGoods, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'appendGoods', payload: { ...payload, ...res } });
        message.success('保存成功！', 3);
      }
    },
    *coverGoods({ payload }, { call, put }) {
      const respon = yield call(putGoods, payload);
      if (respon.error) {
        message.error(`保存失败！${respon.error}`, 5);
      } else {
        yield put({ type: 'resetGoods', payload: { ...payload, ...respon } });
        message.success('保存成功！', 3);
      }
    },
    *removeGoods({ payload }, { call, put }) {
      const res = yield call(deleteGoods, payload);
      if (res.error) {
        message.error(`删除失败！${res.error}`, 5);
      } else {
        yield put({ type: 'clearGoods', payload: { ...payload } });
        message.success('删除成功！', 3);
      }
    },
    *trashGoods(_, { put }) {
      yield put({ type: 'emptyGoods' });
    },
  },

  reducers: {
    queryGoodses(state, action) {
      return {
        ...state,
        goodses: action.payload,
      };
    },

    // Goods:
    queryGoods(state, action) {
      return {
        ...state,
        goods: action.payload,
      };
    },
    appendGoods(state, action) {
      return ({
        ...state,
        goods: action.payload,
      });
    },
    resetGoods(state, action) {
      return ({
        ...state,
        goods: action.payload,
      });
    },
    clearGoods(state, action) {
      return ({
        ...state,
        goods: {
          results: state.goods.results.filter(item => item.objectId !== action.payload.objectId),
          count: state.goods.count - 1,
        },
      });
    },
    emptyGoods(state) {
      return ({
        ...state,
        goods: undefined,
      });
    },
  },
};
