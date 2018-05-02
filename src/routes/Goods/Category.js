import React from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Input } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Category.less';
import CategoryTree from './CategoryTree';
import CategoryTreeSelect from './CategoryTreeSelect';

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
@Form.create()
export default class Category extends React.PureComponent {
  state = {
    selectedKey: '',
    selectedParent: '',
  };

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/fetchCategory',
      payload: { count: true },
    });
  }

  handleSelect = (selectedKeys, e) => {
    this.setState({
      selectedKey: selectedKeys[0],
      selectedParent: e.selectedNodes[0].props.dataRef.parentId.objectId || '',
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { dataCategory } = this.props.category;
    const { selectedKey, selectedParent } = this.state;

    return (
      <PageHeaderLayout
        title="分类管理"
        logo={<img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png" />}
        content="所有商品需归纳分类，提供分类信息的维护及管理。"
      >
        <Row gutter={24}>
          <Col xl={8} lg={24} md={24} sm={24} xs={24}>
            <CategoryTree onSelect={this.handleSelect} dataCategory={dataCategory.results} />
          </Col>
          <Col xl={16} lg={24} md={24} sm={24} xs={24}>
            <Card className={styles.card}>
              <Form>
                <Row>
                  <Form.Item label="父级分类">
                    <CategoryTreeSelect dataCategory={dataCategory.results} value={selectedParent} />
                  </Form.Item>
                </Row>
                <Row>
                  <Form.Item label="分类名称">
                    {getFieldDecorator('name', {
                      rules: [{ required: true, message: '请输入分类名称!' }],
                    })(
                      <Input />
                    )}
                  </Form.Item>
                </Row>

              </Form>
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>

    );
  }
}
