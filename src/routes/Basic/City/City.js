import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Form, List, Card, Row, Col, Input, Button, Icon, Menu, Table, Modal } from 'antd';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from './City.less';

@connect(({ city, loading }) => ({
  city,
  loading: loading.models.city,
}))
@Form.create()
export default class City extends PureComponent {
  state = {
    cityModal: {
      visible: false,
      objectId: '',
      cityNo: '',
      cityName: '',
    },
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'city/fetchCity',
      payload: {
      },
    });
  }

  handleAdd = () => {

  };

  modalOpen = (e, record) => {
    if (record === undefined) {
      this.setState({
        cityModal: {
          visible: true,
          objectId: '',
          cityNo: '',
          cityName: '',
          objectId: '',
        },
      });
    } else {
      this.setState({
        cityModal: {
          visible: true,
          objectId: record.objectId,
          cityNo: record.cityNo,
          cityName: record.cityName,
          objectId: record.objectId,
        },
      });
    }
  };

  modalClose = () => {
    this.setState({
      visible: false,
      cityModal: {
        visible: false,
        objectId: '',
        cityNo: '',
        cityName: '',
        objectId: '',
      },
    });
  };

  modalOk = (e) => {
    e.preventDefault();
    // this.props.form.validateFields({ force: true }, (err, values) => {
    //   if (err === null || !err) {
    //     this.props.onOk(values);
    //   }
    // });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { city: { data }, loading } = this.props;

    const { cityModal } = this.state;

    const columns = [{
      title: '城市编号',
      dataIndex: 'cityNo',
      key: 'cityNo',
    }, {
      title: '城市名称',
      dataIndex: 'cityName',
      key: 'cityName',
    }, {
      title: '操作',
      key: 'action',
      render: (val, record) => {
        return (
          <span>
            {/*<Popconfirm title="确定删除?" onConfirm={() => this.handelDelete(`${val}`)}><a href="#">删除</a></Popconfirm>*/}
            <a onClick={(e) => this.modalOpen(e, record)}>编辑</a>
          </span>
        );
      }
    }];

    const menu = (
      <Menu>
        <Menu.Item>
          <a>编辑</a>
        </Menu.Item>
        <Menu.Item>
          <a>删除</a>
        </Menu.Item>
      </Menu>
    );

    return (
      <PageHeaderLayout>
        <Card>
          <Table
            loading={loading}
            dataSource={data.results}
            columns={columns}
            rowKey='objectId'
            pagination={false}
          />
        </Card>
        <Card>
          <Button type="primary" loading={loading} onClick={e => this.modalOpen(e)} >新增</Button>
        </Card>
        <Card>
          <Modal
            title="Basic Modal"
            visible={cityModal.visible}
            onOk={e => this.modalOk(e)}
            onCancel={this.modalClose}
          >
            <Form>
              { getFieldDecorator('objectId', {
                initialValue: cityModal.objectId,
              })(
                <Input type='hidden'/>
              )}
              <Form.Item label='城市编号' >
                { getFieldDecorator('cityNo', {
                  initialValue: cityModal.cityNo,
                })(
                  <Input />
                )	}
              </Form.Item>
              <Form.Item label='城市名称'>
                { getFieldDecorator('cityName', {
                  initialValue: cityModal.cityName,
                })(
                  <Input />
                )	}
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </PageHeaderLayout>
    );
  }
}
