import React from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
// import PropTypes from 'prop-types';
import { Row, Icon, Card, Button, Table } from 'antd';
import globalConfig from '../../config';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import HeaderSearch from '../../components/HeaderSearch';
import GoodsCard from './Card/GoodsCard';
import styles from './Goodses.less';

@connect(({ goods, group }) => ({
  goods,
  group,
}))
export default class Goodses extends React.Component {
  state = {
    pagination: {
      pageSize: 5,
      current: 1,
      total: 0,
    },
    limit: 15,
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
        include: 'pointerCategory',
      },
    });

    dispatch({
      type: 'group/fetchGroup',
      payload: {
        count: true,
      },
    });
  }

  handleClick = (item) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push(`/goods/goods?${item.objectId}`));
  };

  handelError = (e) => {
    e.preventDefault();
    e.target.src = 'http://becheer.com:1338/parse/files/bee/1d5250aa6277728a23308361d9099215_error.gif';
    e.target.onError = null;
  };

  handlePageChange = (page) => {
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
    const { loading } = this.props;

    const columns = [
      {
        title: '商品主图',
        dataIndex: 'thumbs',
        width: 180,
        render: val => (
          <img style={{ width: '100%' }} onError={e => this.handelError(e)} src={`${globalConfig.imageUrl}${val[0]}`} alt="" />
        ),
      },
      {
        title: '商品名称',
        dataIndex: 'goodsName',
        width: 100,
      },
      {
        title: '商品关键词',
        dataIndex: 'keyword',
        width: 200,
      },
      {
        title: '商品标题',
        dataIndex: 'title',
        width: 200,
      },
      {
        title: '库存',
        dataIndex: 'stock',
        width: 100,
      },
      {
        title: '价格',
        dataIndex: 'price',
        width: 100,
      },
      {
        title: '所属分类',
        dataIndex: 'pointerCategory.name',
      },
      {
        title: '所属分组',
        dataIndex: 'brandName',
      },
      // {
      //   title: '操作',
      //   dataIndex: 'objectId',
      //   render: (val, record) => (
      //     <span>
      //       <a onClick={() => this.handleEditModalVisible(true, `${val}`, record.brandNo, record.brandName)}>编辑  </a>
      //       <Popconfirm title="确定删除?" onConfirm={() => this.handelDelete(`${val}`)}><a href="#">删除</a></Popconfirm>
      //     </span>),
      // },
    ];

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSize: this.state.pagination.pageSize,
      total: goodses === undefined ? 0 : goodses.count,
      showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} 总`,
      current: this.state.pagination.current,
      // onChange: this.handlePageChange,
    };


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
              group={this.props.group.group}
            />
          </Row>
          <Row>
            <Card bordered={false}>
              <div className={styles.tableList}>
                <div className={styles.tableListOperator}>
                  <Button icon="plus" type="primary">
                    新增
                  </Button>
                </div>
                <div>
                  <Card>
                    <div>
                      <Table
                        rowKey="objectId"
                        columns={columns}
                        loading={loading}
                        pagination={paginationProps}
                        dataSource={goodsesData}
                        onChange={this.handleStandardTableChange}
                        // rowSelection={rowSelection}
                        onSelectRow={this.handleSelectRows}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
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
