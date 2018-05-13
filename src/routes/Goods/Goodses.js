import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { connect } from 'dva';
import ImageCard from './Card/ImageCard';

@connect(({ goods }) => ({
  goods,
}))
export default class Goodses extends React.Component {
  state = {};

  render() {
    const { goods } = this.props;
    const { goodsData } = goods;

    return (
      <PageHeaderLayout
        title="商品管理"
        // logo={<Icon type="shop" />}
        content="所有商品信息录入及维护，对商品进行分类、分组、上下架，以及定价等一系列管理操作。"
      >
        <div>
          <ImageCard imageData={goodsData} />
        </div>
      </PageHeaderLayout>
    );
  }
}

// Goodses.propTypes = {
//   goods: PropTypes.object,
// }

// export default connect(({ goods }) => ({ goods }))(Goodses);
