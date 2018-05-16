import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Input, Icon, InputNumber, Switch, Button, Form, Upload, Modal } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Goods.less';
import globalConfig from '../../config';

@connect(({ goods }) => ({
  goods,
}))
@Form.create()
export default class Goods extends React.PureComponent {
  state = {
    goodsData: undefined,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/fetchGoods',
      payload: {
        count: true,
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    const { params } = nextProps.match;
    const { dispatch } = this.props;

    if (!this.state.params) {
      dispatch({
        type: 'goods/fetchGoods',
        payload: {
          where: params,
        },
      });
      this.setState({ params });
    }
  }

  render() {
    const fileList = [{
      uid: 'file0001',
      name: 'card-1.jpeg',
      status: 'done',
      thumbUrl: `${globalConfig.imageUrl}card-1.jpeg`,
    }, {
      uid: 'file0002',
      name: 'card-2.jpeg',
      status: 'done',
      thumbUrl: `${globalConfig.imageUrl}card-2.jpeg`,
    }, {
      uid: 'file0003',
      name: 'card-3.jpeg',
      status: 'done',
      thumbUrl: `${globalConfig.imageUrl}card-3.jpeg`,
    }];

    const uploadButton = (
      <div style={{ width: '110px', height: '110px' }}>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };

    return (
      <div className={styles.goods}>
        <Row gutter={8} >
          <Col xl={8}>
            <Card>
              <Upload
                listType="picture-card"
                defaultFileList={[...fileList]}
              >
                {fileList.length >= 5 ? null : uploadButton}
              </Upload>
              <Modal visible={false} footer={null} onCancel={this.handleCancel}>
                <img alt="example" style={{ width: '100%' }} src="" />
              </Modal>
            </Card>
            <Card>
              Category
            </Card>
            <Card>
              Group
            </Card>
          </Col>
          <Col xl={16}>
            <Card>
              <Form>
                <Form.Item
                  {...formItemLayout}
                  label="商品名称"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品编号"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="上架/下架"
                >
                  <Switch />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}
