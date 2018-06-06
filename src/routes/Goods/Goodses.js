import React from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
// import PropTypes from 'prop-types';
import { Row, Icon, Card, Button, Table, Tag, Input, message, Radio, TreeSelect } from 'antd';
import globalConfig from '../../config';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import GoodsCard from './Card/GoodsCard';
import styles from './Goodses.less';

const { Search } = Input;
const RadioGroup = Radio.Group;

@connect(({ group, goods, category }) => ({
  group,
  goods,
  category,
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
    category: [],
    groups: [],
    pagflag: 0,
    search: '',
    // sortGoods: '',
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
    }).then(() => {
      const { group } = this.props;
      const groupData = group.group.results;
      const groupsName = [];
      for (const i of groupData) {
        groupsName.push({ text: i.name, value: i.objectId });
      }
      this.setState({
        groups: groupsName,
      });
    });

    dispatch({
      type: 'category/fetchCategory',
      payload: {
        count: true,
      },
    }).then(() => {
      const { category } = this.props;
      const categoryData = category.category.results;
      const cate = [];
      for (const i of categoryData) {
        cate.push({ text: i.name, value: i.objectId });
      }
      this.setState({
        category: cate,
      });
    });
  }

  componentWillReceiveProps() {
    // console.log(nextProps);
    const flag = this.state.pagflag;
    this.setState({
      pagflag: flag,
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
    const { formValues, pagflag, search } = this.state;

    const params = {
      skip: ((pagination.current - 1) * pagination.pageSize),
      limit: pagination.pageSize,
      count: true,
      ...formValues,
    };

    if (sorter.field !== undefined && pagflag === 0) {
      // 首先进入排序模式
      dispatch({
        type: 'goods/fetchGoodses',
        payload: {
          count: true,
          limit: 12,
          skip: 0,
          include: 'pointerCategory',
          order: sorter.field,
        },
      }).then(() => {
        this.setState({
          pagflag: 2,
        });
      });
    } else if (pagflag === 2) {
      // 排序模式中
      this.sortGoods(sorter.field, sorter.order, params, pagination.pageSize, pagination.current);
    }
    // 表单多种操作
    if (filtersArg['pointerCategory.name'] !== undefined && filtersArg['pointerCategory.name'].length !== 0) {
      // 表单filter（过滤模式）
      const cateId = filtersArg['pointerCategory.name'][0];
      this.filterCateGory(cateId);
    } else if (pagflag === 0) {
      // 表单正常分页（正常模式）
      dispatch({
        type: 'goods/fetchGoodses',
        payload: {
          ...params,
          include: 'pointerCategory',
        },
      });
      this.setState({
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
        },
      });
    } else if (pagflag === 1) {
      // 表单条件分页（条件模式）
      dispatch({
        type: 'goods/fetchGoodses',
        payload: {
          where: {
            $or: [
              { title: { $regex: `(?i)${search}` } },
              { keyword: { $regex: `(?i)${search}` } },
              { stock: { $regex: `(?i)${search}` } },
              { price: { $regex: `(?i)${search}` } }],
          },
          ...params,
          include: 'pointerCategory',
        },
      });
      this.setState({
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
        },
      });
    }
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
  };

  handleSearch = (value) => {
    const { dispatch } = this.props;
    this.setState({ search: value });
    if (value === '') {
      dispatch({
        type: 'goods/fetchGoodses',
        payload: {
          count: true,
          limit: 12,
          skip: 0,
          include: 'pointerCategory',
        },
      }).then(() => {
        message.success('查询成功');
        const { goodses } = this.props.goods;
        // 变为条件模式
        this.setState({
          pagination: {
            count: goodses === undefined ? 0 : goodses.results.length,
            // pageSize: goodses === undefined ? 0 : goodses.results.length,
            current: 1,
          },
          pagflag: 1,
        });
      });
    } else {
      dispatch({
        type: 'goods/fetchGoodses',
        payload: {
          include: 'pointerCategory',
          where: {
            $or: [
              { title: { $regex: `(?i)${value}` } },
              { keyword: { $regex: `(?i)${value}` } },
              { stock: { $regex: `(?i)${value}` } },
              { price: { $regex: `(?i)${value}` } }],
          },
        },
      }).then(() => {
        message.success('查询成功');
        const { goodses } = this.props.goods;
        // 变为条件模式
        this.setState({
          pagination: {
            count: goodses === undefined ? 0 : goodses.results.length,
            // pageSize: goodses === undefined ? 0 : goodses.results.length,
            current: 1,
          },
          pagflag: 1,
        });
      });
    }
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

  filterCateGory = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/fetchGoodses',
      payload: {
        count: true,
        limit: 12,
        skip: 0,
        include: 'pointerCategory',
        where: {
          pointerCategory: {
            __type: 'Pointer',
            className: 'Category',
            objectId: id,
          },
        },
      },
    });
  }

  filterGroup = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/fetchGoodses',
      payload: {
        count: true,
        limit: 12,
        skip: 0,
        include: 'pointerCategory',
        where: {
          pointerCategory: {
            __type: 'Pointer',
            className: 'Category',
            objectId: id,
          },
        },
      },
    });
  }

  sortGoods = (k, m, p, s, c) => {
    const { dispatch } = this.props;
    if (m === 'ascend') {
      dispatch({
        type: 'goods/fetchGoodses',
        payload: {
          ...p,
          count: true,
          // limit: 12,
          // skip: 0,
          include: 'pointerCategory',
          order: k,
        },
      }).then(() => {
        this.setState({
          pagflag: 2,
          pagination: {
            current: c,
            pageSize: s,
          },
        });
      });
    } else if (m === 'descend') {
      dispatch({
        type: 'goods/fetchGoodses',
        payload: {
          ...p,
          count: true,
          // limit: 12,
          // skip: 0,
          include: 'pointerCategory',
          order: `-${k}`,
        },
      }).then(() => {
        this.setState({
          pagflag: 2,
          pagination: {
            current: c,
            pageSize: s,
          },
        });
      });
    }
  }

  render() {
    const { goodses } = this.props.goods;
    const { group } = this.props.group;
    const goodsesData = goodses.results === undefined ? '' : goodses.results;
    const groupData = group.results === undefined ? '' : group.results;
    const { loading } = this.props;
    const { category } = this.state;
    const { groups } = this.state;

    const colSelect = [{
      label: '商品主图',
      value: '0-0',
      key: '0-0',
    }, {
      label: '商品名称',
      value: '0-1',
      key: '0-1',
    }, {
      label: '商品关键词',
      value: '0-2',
      key: '0-2',
    }, {
      label: '库存',
      value: '0-3',
      key: '0-3',
    }, {
      label: '价格',
      value: '0-4',
      key: '0-4',
    }, {
      label: '所属分类',
      value: '0-5',
      key: '0-5',
    }, {
      label: '所属分组',
      value: '0-6',
      key: '0-6',
    }, {
      label: '操作',
      value: '0-7',
      key: '0-7',
    }];

    const columns = [
      {
        title: '商品主图',
        dataIndex: 'thumbs',
        key: 'thumbs',
        width: '10%',
        render: val => (
          <img style={{ width: '100%' }} onError={e => this.handelError(e)} src={`${globalConfig.imageUrl}${val[0]}`} alt="" />
        ),
      },
      {
        title: '商品名称',
        dataIndex: 'title',
        key: 'title',
        width: '15%',
        // sorter: (a, b) => a.title.length - b.title.length,
        sorter: true,
      },
      {
        title: '商品关键词',
        dataIndex: 'keyword',
        key: 'keyword',
        width: '20%',
        sorter: true,
        // sorter: (a, b) => a.keyword.length - b.keyword.length,
      },
      // {
      //   title: '商品标题',
      //   dataIndex: 'title',
      //   key: 'title',
      //   width: '20%',
      // },
      {
        title: '库存',
        dataIndex: 'stock',
        key: 'stock',
        sorter: (a, b) => a.stock - b.stock,
        width: '10%',
      },
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        sorter: (a, b) => a.price - b.price,
        width: '10%',
      },
      {
        title: '所属分类',
        dataIndex: 'pointerCategory.name',
        key: 'pointerCategory.name',
        width: '10%',
        filters: category,
        // onFilter: value => this.filterCateGory(value),
        render: val => (
          <Tag color="cyan">{val}</Tag>
        ),
      },
      {
        title: '所属分组',
        dataIndex: 'goodsGroup',
        key: 'goodsGroup',
        width: '15%',
        filters: groups,
        onFilter: (value, record) => record.goodsGroup.indexOf(value) === 0,
        render: val => (
          groupData && val ?
            val.map((i) => {
              const groupes = groupData.find(k => k.objectId === i);
              if (groupes) {
                // 多个Tag需要加key区分;
                return (<Tag color="gold" key={groupes.objectId}>{groupes.name}</Tag>);
              } else {
                return null;
              }
            }) :
            null
        ),
      },
      {
        title: '操作',
        dataIndex: 'objectId',
        key: 'objectId',
        width: '15%',
        render: val => (
          <span>
            <Link className={styles.addgoods} to={`/goods/goods?${val}`}>编辑</Link>
          </span>),
      },
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
          <TreeSelect
            treeCheckable
            treeData={colSelect}
            placeholder="请选择列"
            style={{ marginLeft: 20, width: 400 }}
            defaultValue={['0-0', '0-1', '0-2', '0-3', '0-4', '0-5', '0-6', '0-7']}
          />
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
            <Card bordered={false}>
              <div className={styles.tableList}>
                <div>
                  <Card>
                    <div>
                      <Table
                        rowKey={record => record.objectId}
                        columns={columns}
                        loading={loading}
                        pagination={paginationProps}
                        dataSource={goodsesData}
                        onChange={this.handleStandardTableChange}
                      />
                    </div>
                  </Card>
                </div>
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
        </div>
      </PageHeaderLayout>
    );
  }
}

