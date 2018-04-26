import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Popconfirm, Select, Button, message, Table } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import CreateForm from './creatForm';

import styles from './Region.less';

const { Item } = Form;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ region, loading }) => ({
  region,
  loading: loading.models.region,
  regions: region.regions,
  regionNos: region.regionNos,
  requestError: region.requestError,
}))
@Form.create()
export default class Region extends PureComponent {
  state = {
    pagination: {
      pageSize: 5,
      current: 1,
      total: 0,
    },
    modalVisible: false,
    formValues: {},
    editId: {},
    regionNo: '',
    regionName: '',
    pointerbrand: '',
    title: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'region/fetchRegion',
      payload: {
        skip: 0,
        limit: 5,
        count: true,
      },
    });
    dispatch({
      type: 'region/getBrands',
    });
  }

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
      type: 'region/fetchRegion',
      payload: params,
    });
    this.setState({
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
  };

  handleFormAdd = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'region/fetchRegion',
      payload: {
        skip: 0,
        limit: 5,
        count: true,
      },
    });
    this.setState({
      pagination: {
        current: 1,
        pageSize: 5,
      },
    });
  };
  handelDelete = (row) => {
    const { region: { data }, dispatch } = this.props;
    const { pagination: { current } } = this.state;
    dispatch({
      type: 'region/removeRegion',
      payload: row,
    }).then(() => {
      if (data.results.length > 1) {
        const params = {
          skip: ((this.state.pagination.current - 1) * this.state.pagination.pageSize) > 0 ?
            ((this.state.pagination.current - 1) * this.state.pagination.pageSize) : 0,
          limit: this.state.pagination.pageSize,
          count: true,
        };
        dispatch({
          type: 'region/fetchRegion',
          payload: params,
        });
      } else {
        const params = {
          skip: ((this.state.pagination.current - 2) * this.state.pagination.pageSize) > 0 ?
            ((this.state.pagination.current - 2) * this.state.pagination.pageSize) : 0,
          limit: this.state.pagination.pageSize,
          count: true,
        };
        dispatch({
          type: 'region/fetchRegion',
          payload: params,
        });
        this.setState({
          pagination: {
            current: current - 1,
            pageSize: 5,
          },
        });
      }
    });
  };

  handleSearch = (e) => {
    e.preventDefault();

    const { region: { data }, dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'region/requireQuery',
        payload: { where: values },
      }).then(message.success('查询成功'));

      this.setState({
        pagination: {
          pageSize: data === undefined ? 0 : data.results.length,
        },
      });
    });
  };

  handleAddModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
      regionNo: '',
      regionName: '',
      editId: '',
      title: '新增',
      pointerbrand: '',
    });
  };

  handleEditModalVisible = (flag, id, no, name, pointerbrand) => {
    this.setState({
      modalVisible: flag,
      regionNo: no,
      regionName: name,
      editId: id,
      title: '编辑',
      pointerbrand: { ...pointerbrand },
    });
  };

  handleAdd = (fields) => {
    const { dispatch } = this.props;
    const pointerBrand = {
      pointerBrand: {
        __type: 'Pointer',
        className: 'Brand',
        objectId: fields.brandName,
      },
    };
    dispatch({
      type: 'region/storeRegion',
      payload: { fields, pointerBrand },
    }).then(() => {
      this.setState({
        modalVisible: false,
      });
      const params = {
        skip: ((this.state.pagination.current - 1) * this.state.pagination.pageSize) > 0 ?
          ((this.state.pagination.current - 1) * this.state.pagination.pageSize) : 0,
        limit: this.state.pagination.pageSize,
        count: true,
      };
      dispatch({
        type: 'region/fetchRegion',
        payload: params,
      });
    }
    );
  };

  handleEdit = (fields) => {
    const { dispatch } = this.props;
    const ojId = this.state.editId;
    const pointerBrand = {
      pointerBrand: {
        __type: 'Pointer',
        className: 'Brand',
        objectId: fields.brandName,
      },
    };
    dispatch({
      type: 'region/coverRegion',
      payload: { fields, pointerBrand, ojId },
    }).then(() => {
      this.setState({
        modalVisible: false,
      });
      const params = {
        skip: ((this.state.pagination.current - 1) * this.state.pagination.pageSize) > 0 ?
          ((this.state.pagination.current - 1) * this.state.pagination.pageSize) : 0,
        limit: this.state.pagination.pageSize,
        count: true,
      };
      dispatch({
        type: 'region/fetchRegion',
        payload: params,
      });
    });
  };

  validateRegionNo = (rule, value, callback) => {
    const { regionNo } = this.state;
    if (value === regionNo) {
      callback();
    }
    if (value === undefined || value === '') {
      callback();
    } else {
      this.props.dispatch({
        type: 'region/exisRegionNos',
        payload: { where: { regionNo: value } },
      }).then(() => {
        if (this.props.regionNos.results === undefined) {
          callback();
          return;
        }
        if (this.props.regionNos.results.length > 0) {
          callback([new Error(rule.message)]);
        } else {
          callback();
        }
      });
    }
  };


  render() {
    const { region: { data, brands }, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { modalVisible, title, regionNo, regionName, pointerbrand } = this.state;

    const columns = [
      {
        title: '编号',
        dataIndex: 'regionNo',
      },
      {
        title: '大区名称',
        dataIndex: 'regionName',
      },
      {
        title: '关联品牌',
        dataIndex: 'pointerBrand.brandName',
      },
      {
        title: '操作',
        dataIndex: 'objectId',
        render: (val, record) => (
          <span>
            <a onClick={() => this.handleEditModalVisible(true, `${val}`, record.regionNo, record.regionName, record.pointerBrand)}>编辑  </a>
            <Popconfirm title="确定删除?" onConfirm={() => this.handelDelete(`${val}`)}><a href="#">删除</a></Popconfirm>
          </span>),
      },
    ];

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      pageSize: this.state.pagination.pageSize,
      total: data === undefined ? 0 : data.count,
      showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} 总`,
      current: this.state.pagination.current,
    };

    return (
      <PageHeaderLayout title="大区管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <Item label="编号">
                      {getFieldDecorator('regionNo')(
                        <Input placeholder="请输入" />
                      )}
                    </Item>
                  </Col>
                  <Col md={8} sm={24}>
                    <Item label="大区名称">
                      {getFieldDecorator('regionName')(
                        <Select
                          placeholder="请选择"
                          style={{ width: '100%' }}
                        >
                          { data !== undefined ?
                            data.results.map(d => (
                              <Select.Option key={d.objectId} value={d.regionName}>
                                {d.regionName}
                              </Select.Option>
)) :
                            <Select.Option key="1" > 暂无</Select.Option> }
                        </Select>
                      )}
                    </Item>
                  </Col>
                  <Col md={8} sm={24}>
                    <span className={styles.submitButtons}>
                      <Button type="primary" htmlType="submit">查询</Button>
                      <Button style={{ marginLeft: 8 }} onClick={this.handleFormAdd}>刷新</Button>
                    </span>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleAddModalVisible(true)}>
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
                    dataSource={data === undefined ? '' : data.results}
                    onChange={this.handleStandardTableChange}
                    onSelectRow={this.handleSelectRows}
                  />
                </div>
              </Card>
            </div>
          </div>
        </Card>
        <CreateForm
          handleAdd={this.handleAdd}
          handleEdit={this.handleEdit}
          handleModalVisible={this.handleAddModalVisible}
          title={title}
          validateRegionNo={this.validateRegionNo}
          modalVisible={modalVisible}
          regionNo={regionNo}
          regionName={regionName}
          pointerbrand={pointerbrand}
          brands={brands.results}
        />
      </PageHeaderLayout>
    );
  }
}
