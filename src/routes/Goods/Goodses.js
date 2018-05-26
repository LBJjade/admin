import React from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import PropTypes from 'prop-types';
import { Row, Icon, Card } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import HeaderSearch from '../../components/HeaderSearch';
// import ImageCard from './Card/ImageCard';
import GoodsCard from './Card/GoodsCard';
import styles from './Goodses.less';

@connect(({ goods }) => ({
  goods,
}))
export default class Goodses extends React.Component {
  state = {
    limit: 9,
    skip: 0,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/fetchGoodses',
      payload: {
        count: true,
        limit: this.state.limit,
        skip: this.state.skip,
      },
    });
  }

  handleClick = (item) => {
    // const { dispatch } = this.props;
    // const url = '/goods/goods';
    // dispatch(routerRedux.push({
    //   pathname: url,
    //   state: {
    //     objectId: item.objectId,
    //   },
    // }));
    const { dispatch } = this.props;
    dispatch(routerRedux.push(`/goods/goods?${item.objectId}`));
  };

  handlePageChange = (page) => {
    // console.log(page);
    const skip = (page - 1) * this.state.limit;
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/fetchGoodses',
      payload: {
        count: true,
        limit: this.state.limit,
        skip,
      },
    });
    this.setState({
      skip,
    });
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
            <Card>
              <div>
                <HeaderSearch className={styles.search}>HeaderSearch</HeaderSearch>
                <Link className={styles.addgoods} to="/goods/goods"><Icon type="plus" /> 新增商品</Link>
              </div>
            </Card>
          </Row>
          <Row>
            <GoodsCard
              data={goodsesData}
              onClick={item => this.handleClick(item)}
              pagination={{
                onChange: page => this.handlePageChange(page),
                pageSize: this.state.limit,
                total: goodses.count,
              }}
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
