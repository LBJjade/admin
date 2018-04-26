import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Popconfirm, Select, Button, message, Table } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import CreateForm from './creatForm';

import styles from './Brand.less';

const { Item } = Form;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ brand, loading }) => ({
  brand,
  loading: loading.models.brand,
  brands: brand.brands,
  brandNos: brand.brandNos,
  requestError: brand.requestError,
}))
@Form.create()
export default class Brand extends PureComponent {
  state = {
    pagination: {
      pageSize: 5,
      current: 1,
      total: 0,
    },
    modalVisible: false,
    formValues: {},
    editId: {},
    brandNo: '',
    brandName: '',
    title: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'brand/fetchBrand',
      payload: {
        skip: 0,
        limit: 5,
        count: true,
      },
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
      type: 'brand/fetchBrand',
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
      type: 'brand/fetchBrand',
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
    const { brand: { data }, dispatch } = this.props;
    const { pagination: { current } } = this.state;
    dispatch({
      type: 'brand/removeBrand',
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
          type: 'brand/fetchBrand',
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
          type: 'brand/fetchBrand',
          payload: params,
        });
        this.setState({
          pagination: {
            current: (current - 1) > 0 ? (current - 1) : 1,
            pageSize: 5,
          },
        });
      }
    });
  };

  handleSearch = (e) => {
    e.preventDefault();

    const { brand: { data }, dispatch, form } = this.props;

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
        type: 'brand/requireQuery',
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
      brandNo: '',
      brandName: '',
      editId: '',
      title: '新增',
    });
  };

  handleEditModalVisible = (flag, id, no, name) => {
    this.setState({
      modalVisible: flag,
      brandNo: no,
      brandName: name,
      editId: id,
      title: '编辑',
    });
  };

  handleAdd = (fields) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'brand/storeBrand',
      payload: fields,
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
        type: 'brand/fetchBrand',
        payload: params,
      });
    }
    );
  };

  handleEdit = (fields) => {
    const { dispatch } = this.props;
    const ojId = this.state.editId;
    dispatch({
      type: 'brand/coverBrand',
      payload: { fields, ojId },
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
        type: 'brand/fetchBrand',
        payload: params,
      });
    });
  };

  validateBrandNo = (rule, value, callback) => {
    const { brandNo } = this.state;
    if (value === brandNo) {
      callback();
    }
    if (value === undefined || value === '') {
      callback();
    } else {
      this.props.dispatch({
        type: 'brand/exisBrandNos',
        payload: { where: { brandNo: value } },
      }).then(() => {
        if (this.props.brandNos.results === undefined) {
          callback();
          return;
        }
        if (this.props.brandNos.results.length > 0) {
          callback([new Error(rule.message)]);
        } else {
          callback();
        }
      });
    }
  };


  render() {
    const { brand: { data }, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { modalVisible, title, brandNo, brandName } = this.state;

    const columns = [
      {
        title: '编号',
        dataIndex: 'brandNo',
      },
      {
        title: '品牌名称',
        dataIndex: 'brandName',
      },
      {
        title: '操作',
        dataIndex: 'objectId',
        render: (val, record) => (
          <span>
            <a onClick={() => this.handleEditModalVisible(true, `${val}`, record.brandNo, record.brandName)}>编辑  </a>
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
      // onChange: this.handlePageChange,
    };

    return (
      <PageHeaderLayout title="品牌管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <Item label="编号">
                      {getFieldDecorator('brandNo')(
                        <Input placeholder="请输入" />
                      )}
                    </Item>
                  </Col>
                  <Col md={8} sm={24}>
                    <Item label="品牌名称">
                      {getFieldDecorator('brandName')(
                        <Select
                          placeholder="请选择"
                          style={{ width: '100%' }}
                        >{
                          data !== undefined ?
                            data.results.map(d => (
                              <Option key={d.objectId} value={d.brandName}>
                                {d.brandName}
                              </Option>
)) :
                            <Option key="1" > 暂无</Option> }
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
                    // rowSelection={rowSelection}
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
          validateBrandNo={this.validateBrandNo}
          modalVisible={modalVisible}
          brandNo={brandNo}
          brandName={brandName}
        />
      </PageHeaderLayout>
    );
  }
}
