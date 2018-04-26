import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Popconfirm, Select, Button, message, Table } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import CreateForm from './creatForm';

import styles from './District.less';

const { Item } = Form;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ district, loading }) => ({
  district,
  loading: loading.models.district,
  districts: district.districts,
  districtNos: district.districtNos,
  requestError: district.requestError,
}))
@Form.create()
export default class District extends PureComponent {
  state = {
    pagination: {
      pageSize: 5,
      current: 1,
      total: 0,
    },
    modalVisible: false,
    formValues: {},
    editId: {},
    districtNo: '',
    districtName: '',
    pointerbrand: '',
    title: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'district/fetchDistrict',
      payload: {
        skip: 0,
        limit: 5,
        count: true,
      },
    });
    dispatch({
      type: 'district/getBrands',
    });
    dispatch({
      type: 'district/getRegions',
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
      type: 'district/fetchDistrict',
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
      type: 'district/fetchDistrict',
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
    const { district: { data }, dispatch } = this.props;
    const { pagination: { current } } = this.state;
    dispatch({
      type: 'district/removeDistrict',
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
          type: 'district/fetchDistrict',
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
          type: 'district/fetchDistrict',
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

    const { district: { data }, dispatch, form } = this.props;

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
        type: 'district/requireQuery',
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
      districtNo: '',
      districtName: '',
      editId: '',
      pointerbrand: '',
      pointerregion: '',
      title: '新增',
    });
  };

  handleEditModalVisible = (flag, id, no, name, pointerbrand, pointerregion) => {
    this.setState({
      modalVisible: flag,
      districtNo: no,
      districtName: name,
      pointerbrand: { ...pointerbrand },
      pointerregion: { ...pointerregion },
      editId: id,
      title: '编辑',
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
    const pointerRegion = {
      pointerRegion: {
        __type: 'Pointer',
        className: 'Region',
        objectId: fields.regionName,
      },
    };
    dispatch({
      type: 'district/storeDistrict',
      payload: { fields, pointerBrand, pointerRegion },
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
        type: 'district/fetchDistrict',
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
    const pointerRegion = {
      pointerRegion: {
        __type: 'Pointer',
        className: 'Region',
        objectId: fields.regionName,
      },
    };
    dispatch({
      type: 'district/coverDistrict',
      payload: { fields, pointerBrand, pointerRegion, ojId },
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
        type: 'district/fetchDistrict',
        payload: params,
      });
    });
  };

  validateDistrictNo = (rule, value, callback) => {
    const { districtNo } = this.state;
    if (value === districtNo) {
      callback();
    }
    if (value === undefined || value === '') {
      callback();
    } else {
      this.props.dispatch({
        type: 'district/exisDistrictNos',
        payload: { where: { districtNo: value } },
      }).then(() => {
        if (this.props.districtNos.results === undefined) {
          callback();
          return;
        }
        if (this.props.districtNos.results.length > 0) {
          callback([new Error(rule.message)]);
        } else {
          callback();
        }
      });
    }
  };


  render() {
    const { district: { data, brands, regions }, loading } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { modalVisible, title, districtNo, districtName, pointerbrand, pointerregion } =
      this.state;

    const columns = [
      {
        title: '编号',
        dataIndex: 'districtNo',
      },
      {
        title: '区域名称',
        dataIndex: 'districtName',
      },
      {
        title: '关联品牌',
        dataIndex: 'pointerBrand.brandName',
      },
      {
        title: '关联大区',
        dataIndex: 'pointerRegion.regionName',
      },
      {
        title: '操作',
        dataIndex: 'objectId',
        render: (val, record) => (
          <span>
            <a onClick={() => this.handleEditModalVisible(true, `${val}`, record.districtNo, record.districtName, record.pointerBrand, record.pointerRegion)}>编辑  </a>
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
      <PageHeaderLayout title="区域管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <Item label="编号">
                      {getFieldDecorator('districtNo')(
                        <Input placeholder="请输入" />
                      )}
                    </Item>
                  </Col>
                  <Col md={8} sm={24}>
                    <Item label="区域名称">
                      {getFieldDecorator('districtName')(
                        <Select
                          placeholder="请选择"
                          style={{ width: '100%' }}
                        >
                          { data !== undefined ?
                            data.results.map(d => (
                              <Option key={d.objectId} value={d.districtName}>
                                {d.districtName}
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
          validateDistrictNo={this.validateDistrictNo}
          modalVisible={modalVisible}
          districtNo={districtNo}
          districtName={districtName}
          option={brands.results}
          option2={regions.results}
          pointerbrand={pointerbrand}
          pointerregion={pointerregion}
        />
      </PageHeaderLayout>
    );
  }
}
