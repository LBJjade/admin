import { message } from 'antd';
import { getGoods, postGoods, putGoods, deleteGoods } from '../services/goods';

export default {
  namespace: 'goods',

  state: {
    goodses: {
      results: [],
      count: 0,
    },
    goods: {
      results: [],
      count: 0,
    },
    goodsData: [
      {
        objectId: '0001',
        image: 'card-1.jpeg',
        title: '我们的田野，美丽地田野。',
        goodsSn: 'SN0001',
        goodsName: '美丽牌田野',
        price: 1000,
        status: 1,
        description: '碧绿的河水流过无边的稻田，无边的稻田，好像起伏的海面。',
        shop: '金挑喜选',
        images: ['card-1.jpeg', 'card-2.jpeg', 'card-3.jpeg'],
        categoryName: '钻石',
        categoryColor: 'cyan',
        groupName: ['经典系列'],
      },
      {
        objectId: '0002',
        image: 'card-2.jpeg',
        title: '一江春水向东流',
        description: '问君能有几多愁，恰似一江春水向东流。',
        shop: '儋州金大福',
        images: ['card-2.jpeg', 'card-3.jpeg', 'card-4.jpeg'],
        goodsSn: 'SN0002',
        categoryName: '黄金',
        categoryColor: 'gold',
        price: 1200,
      },
      {
        objectId: '0003',
        image: 'card-3.jpeg',
        title: '走在乡间的小路上',
        description: '噢，噢，噢，他们唱，还有一支短笛在吹响。',
        shop: '一品清源',
        images: ['card-3.jpeg', 'card-4.jpeg', 'card-5.jpeg'],
        goodsSn: 'SN0003',
        categoryColor: 'blue',
        categoryName: '彩宝',
        price: 1380,
      },
      {
        objectId: '0004',
        image: 'card-4.jpeg',
        title: '啊！大海，我的故乡。',
        description: 'here is desc，Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la ...',
        shop: '石头记',
        images: ['card-4.jpeg', 'card-5.jpeg', 'card-6.jpeg'],
        goodsSn: 'SN0004',
        categoryName: '银饰',
        categoryColor: 'gray',
        price: 6800,
      },
      {
        objectId: '0005',
        image: 'card-5.jpeg',
        title: '天空之恋',
        description: '飞向天空，找寻遥远的梦想。',
        shop: '钻石小鸟',
        images: ['card-5.jpeg', 'card-6.jpeg', 'card-1.jpeg'],
        goodsSn: 'SN0005',
        categoryName: '珍珠',
        categoryColor: 'black',
        price: 8900,
      },
      {
        objectId: '0006',
        image: 'card-6.jpeg',
        title: '乡村与小镇',
        description: 'here is desc，Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la ...',
        shop: '周生生',
        images: ['card-6.jpeg', 'card-1.jpeg', 'card-2.jpeg'],
        goodsSn: 'SN0006',
        categoryName: '砗磲',
        price: 12800,
      },
      // {
      //   objectId: '0007',
      //   image: 'card-1.jpeg',
      //   title: '我们的田野，美丽地田野。',
      //   description: '碧绿的河水流过无边的稻田，无边的稻田，好像起伏的海面。',
      //   shop: '金挑喜选',
      //   images: ['card-1.jpeg', 'card-2.jpeg', 'card-3.jpeg'],
      //   goodsSn: 'SN0001',
      //   categoryName: '钻石',
      //   price: 1000,
      //   groupName: ['经典系列'],
      // },
      // {
      //   objectId: '0008',
      //   image: 'card-2.jpeg',
      //   title: '一江春水向东流',
      //   description: '问君能有几多愁，恰似一江春水向东流。',
      //   shop: '儋州金大福',
      //   images: ['card-2.jpeg', 'card-3.jpeg', 'card-4.jpeg'],
      //   goodsSn: 'SN0002',
      //   categoryName: '黄金',
      //   price: 1200,
      // },
      // {
      //   objectId: '0009',
      //   image: 'card-3.jpeg',
      //   title: '走在乡间的小路上',
      //   description: '噢，噢，噢，他们唱，还有一支短笛在吹响。',
      //   shop: '一品清源',
      //   images: ['card-3.jpeg', 'card-4.jpeg', 'card-5.jpeg'],
      //   goodsSn: 'SN0003',
      //   categoryName: '彩宝',
      //   price: 1380,
      // },
      // {
      //   objectId: '0010',
      //   image: 'card-4.jpeg',
      //   title: 'here is title',
      //   description: 'here is desc，Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la ...',
      //   shop: '石头记',
      //   images: ['card-4.jpeg', 'card-5.jpeg', 'card-6.jpeg'],
      //   goodsSn: 'SN0004',
      //   categoryName: '银饰',
      //   price: 6800,
      // },
      // {
      //   objectId: '0011',
      //   image: 'card-5.jpeg',
      //   title: '热气球啊啊',
      //   description: 'here is desc，Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la ...',
      //   shop: '钻石小鸟',
      //   images: ['card-5.jpeg', 'card-6.jpeg', 'card-1.jpeg'],
      //   goodsSn: 'SN0005',
      //   categoryName: '珍珠',
      //   price: 8900,
      // },
      // {
      //   objectId: '0012',
      //   image: 'card-6.jpeg',
      //   title: 'here is title',
      //   description: 'here is desc，Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la Ba la ...',
      //   shop: '周生生',
      //   images: ['card-6.jpeg', 'card-1.jpeg', 'card-2.jpeg'],
      //   goodsSn: 'SN0006',
      //   categoryName: '砗磲',
      //   price: 12800,
      // },
    ],
  },

  effects: {
    // goodses
    *fetchGoodses({ payload }, { call, put }) {
      const respon = yield call(getGoods, payload);
      yield put({ type: 'queryGoodses', payload: respon });
    },

    // goods
    *fetchGoods({ payload }, { call, put }) {
      const respon = yield call(getGoods, payload);
      yield put({ type: 'queryGoods', payload: respon });
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
      const res = yield call(putGoods, payload);
      if (res.error) {
        message.error(`保存失败！${res.error}`, 5);
      } else {
        yield put({ type: 'resetGoods', payload: { ...payload, ...res } });
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
        goods: {
          results: state.Goods.results.concat(action.payload),
          count: state.data.count + 1,
        },
      });
    },

    resetGoods(state, action) {
      return ({
        ...state,
        goods: {
          results: state.goods.results.map((item) => {
            if (item.objectId === action.payload.objectId) {
              return { ...item, ...action.payload };
            } else {
              return item;
            }
          }),
        },
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

  },
};
