import React from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
// import PropTypes from 'prop-types';
import { Row, Icon, Card, Button, Table, Tag, Input, message, Radio } from 'antd';
import globalConfig from '../../config';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import GoodsCard from './Card/GoodsCard';
import styles from './Goodses.less';

const { Search } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ group, goods }) => ({
  group,
  goods,
}))
export default class Goodses extends React.Component {
  state = {
    pagination: {
      pageSize: 12,
      current: 1,
      total: 0,
    },
    limit: 12,
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
        include: 'pointerCategory',
        skip,
      },
    });
    this.setState({
      skip,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      skip: ((pagination.current - 1) * pagination.pageSize),
      limit: pagination.pageSize,
      count: true,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'goods/fetchGoodses',
      payload: params,
    });
    this.setState({
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
  };

  handleSearch = (value) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/fetchGoodses',
      payload: {
        where: {
          title: {
            $regex: `(?i)${value}`,
          },
        },
      },
    }).then(() => {
      message.success('查询成功');
      const { goodses } = this.props.goods;
      this.setState({
        pagination: {
          count: goodses === undefined ? 0 : goodses.results.length,
          pageSize: goodses === undefined ? 0 : goodses.results.length,
          current: 1,
        },
      });
    });
  };
  fetchGoodes = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/fetchGoodses',
      payload: {
        count: true,
        limit: 12,
        skip: 0,
        include: 'pointerCategory',
      },
    });
  };

  render() {
    const { goodses } = this.props.goods;
    const { group } = this.props.group;
    const goodsesData = goodses.results;
    const groupData = group.results;
    const { loading } = this.props;

    const columns = [
      {
        title: '商品主图',
        dataIndex: 'thumbs',
        width: 120,
        render: val => (
          <img style={{ width: '100%' }} onError={e => this.handelError(e)} src={`${globalConfig.imageUrl}${val[0]}`} alt="" />
        ),
      },
      {
        title: '商品名称',
        dataIndex: 'title',
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
        filters: [{
          text: 'London',
          value: 'London',
        }, {
          text: 'New York',
          value: 'New York',
        }],
        render: val => (
          <Tag color="cyan">{val}</Tag>
        ),
      },
      {
        title: '所属分组',
        dataIndex: 'goodsGroup',
        width: 160,
        render: val => (
          groupData && val ?
            val.map((i) => {
              const groups = groupData.find(k => k.objectId === i);
              if (groups) {
                // 多个Tag需要加key区分;
                return (<Tag color="gold" key={groups.objectId}>{groups.name}</Tag>);
              } else {
                return null;
              }
            }) :
            null
        ),
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

    const extraContent = (
      <div>
        <RadioGroup defaultValue="all">
          <RadioButton value="all" onClick={() => this.fetchGoodes}>全部</RadioButton>
        </RadioGroup>
        <Search
          className={styles.extraContentSearch}
          placeholder="搜索"
          enterButton
          onSearch={value => this.handleSearch(value)}
        />
      </div>
    );


    return (
      <PageHeaderLayout
        title="商品管理"
        // logo={<Icon type="shop" />}
        content="所有商品信息录入及维护，对商品进行分类、分组、上下架，以及定价等一系列管理操作。"
      >
        <div>
          <Row>
            <Card
              title="商品列表"
              extra={extraContent}
            >
              <div>
                <Button type="primary"><Link className={styles.addgoods} to="/goods/goods"><Icon type="plus" /> 新增</Link></Button>
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
                        // onSelectRow={this.handleSelectRows}
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

