import React from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import PropTypes from 'prop-types';
import { Row, Icon } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
// import ImageCard from './Card/ImageCard';
import GoodsCard from './Card/GoodsCard';
import styles from './Goodses.less';

@connect(({ goods }) => ({
  goods,
}))
export default class Goodses extends React.Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/fetchGoodses',
      payload: {
        count: true,
        limit: 6,
        skip: 0,
      },
    });
  }


  handleClick = (item) => {
    const url = `/goods/goods/${item.objectId}`;
    this.props.dispatch(routerRedux.push(url));
  };

  render() {
    const { goodses } = this.props.goods;
    const goodsesData = goodses.results;

    return (
      <PageHeaderLayout
        title="商品管理"
        // logo={<Icon type="shop" />}
        content="所有商品信息录入及维护，对商品进行分类、分组、上下架，以及定价等一系列管理操作。"
      >
        <div>
          <Row>
            <div align="right">
              <Link className={styles.addgoods} to="/goods/goods"><Icon type="plus" /> 新增产品</Link>
            </div>
          </Row>
          <Row>
            <GoodsCard
              data={goodsesData}
              onClick={item => this.handleClick(item)}
            />
          </Row>
        </div>
      </PageHeaderLayout>
    );
  }
}

// Goodses.propTypes = {
//   goods: PropTypes.object,
// }

// export default connect(({ goods }) => ({ goods }))(Goodses);
