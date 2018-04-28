import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Tree, Icon, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Category.less';
import CategoryTree from './CategoryTree';

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
export default class Category extends PureComponent {
  state = {
  };

  handleSelect = (selectedKeys, e) => {
    console.log(e);
  };

  render() {
    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        return <Tree.TreeNode key={item.key} title={item.key}>{loop(item.children)}</Tree.TreeNode>;
      }
      return <Tree.TreeNode key={item.key} title={item.key} />;
    });
    return (
      <PageHeaderLayout
        title="分类管理"
        logo={<img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png" />}
        content="所有商品需归纳分类，提供分类信息的维护及管理。"
      >
        <Row gutter={24}>
          <Col xl={8} lg={24} md={24} sm={24} xs={24}>
            <CategoryTree onSelect={this.handleSelect} />
          </Col>
          <Col xl={16} lg={24} md={24} sm={24} xs={24}>
            <Card className={styles.card}>
              Tree Node Props
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>

    );
  }
}
