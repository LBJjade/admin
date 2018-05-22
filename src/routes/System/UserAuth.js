import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Form, Input, Button, Card, Tag, Tooltip, Row, Col, Select, List, Icon } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ account }) => ({
  account,
}))
@Form.create()
export default class BasicForms extends PureComponent {
  // state = {
  //   onAuth: 0,
  // };
  componentDidMount() {
    // const id = localStorage.getItem('currentUserId');
    const { dispatch } = this.props;
    dispatch({
      type: 'account/fetchUser',
      payload: {
        where: {
          objectId: this.props.match.params.id,
        },
      },
    });
    dispatch({
      type: 'account/fetchAddress',
      payload: {
      },
    });
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'account/storeUserAuth',
          payload: {
            values,
            tags: values.tags,
          },
        }).then(() => {
          this.props.dispatch(routerRedux.push('/system/user'));
        });
      }
    });
  }
  render() {
    const { account: { user, address } } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <PageHeaderLayout title="实名认证" content="">
        <Row>
          <Col span={12}>
            <Card title="账号信息">
              <Form
                hideRequiredMark
                style={{ marginTop: 8 }}
              >
                <FormItem
                  {...formItemLayout}
                  label="昵称"
                >
                  {(
                    <Tooltip title="prompt text">
                      <span>{user.username}</span>
                    </Tooltip>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="会员类型"
                >
                  {(
                    <Tag color="red">未认证</Tag>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="注册时间"
                >
                  {(
                    <Tooltip title="prompt text">
                      <span>{moment(user.createdAt).format('YYYY-MM-DD hh:mm')}</span>
                    </Tooltip>
                  )}
                </FormItem>
              </Form>
            </Card>
            <Card title="实名认证" >
              <Form
                style={{ marginTop: 8 }}
              >
                <FormItem
                  {...formItemLayout}
                  label="认证姓名"
                >
                  {getFieldDecorator('authName', {
                    rules: [{
                      required: true, message: '姓名不能为空',
                    }],
                    validateFirst: true,
                    validateTrigger: 'onBlur',
                  })(
                    <Input placeholder="请输入认证姓名" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="身份证号"
                >
                  {getFieldDecorator('indentityCard', {
                    rules: [
                      { required: true, message: '身份证号不能为空' },
                      { fieldname: 'indentityCard', required: true, pattern: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/, message: '身份证号格式错误！' },
                      ],
                    validateFirst: true,
                    validateTrigger: 'onBlur',
                  })(
                    <Input placeholder="请输入身份证号" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="身份证"
                >
                  {getFieldDecorator('goal', {
                  })(
                    <TextArea style={{ minHeight: 32 }} placeholder="" rows={4} />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="联系手机"
                >
                  {getFieldDecorator('mobile', {
                    rules: [
                      { fieldname: 'mobile', required: true, message: '联系手机不能为空' },
                      { fieldname: 'mobile', required: true, pattern: /^1\d{10}$/, message: '手机号码格式错误！' },
                    ],
                    validateFirst: true,
                    validateTrigger: 'onBlur',
                  })(
                    <Input placeholder="请输入联系手机" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="联系电话"
                >
                  {getFieldDecorator('tel', {
                  })(
                    <Input placeholder="请输入联系电话" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="E-mail"
                >
                  {getFieldDecorator('email', {
                    rules: [
                      { fieldname: 'email', pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/, message: 'E-mail格式错误！' },
                    ],
                    validateFirst: true,
                    validateTrigger: 'onBlur',
                  })(
                    <Input placeholder="请输入E-mail" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="QQ"
                >
                  {getFieldDecorator('QQ', {
                    rules: [
                      { fieldname: 'QQ', pattern: /^[1-9][0-9]{4,10}$/, message: 'QQ号格式错误！' },
                    ],
                    validateFirst: true,
                    validateTrigger: 'onBlur',
                  })(
                    <Input placeholder="请输入QQ" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="微信"
                >
                  {getFieldDecorator('wechat', {
                  })(
                    <Input placeholder="请输入微信" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="标签"
                >
                  {getFieldDecorator('tags', {
                  })(
                    <Select mode="tags" placeholder="请输入标签" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="备注"
                >
                  {getFieldDecorator('remark')(
                    <TextArea style={{ minHeight: 32 }} placeholder="请输入备注" rows={4} />
                  )}
                </FormItem>
                <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                  <Button type="primary" htmlType="button" onClick={e => this.handleSubmit(e)}>
                    提交
                  </Button>
                </FormItem>
              </Form>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="收货地址" >
              <List
                dataSource={address.results}
                renderItem={item => (
                  <div>
                    <div style={{ fontWeight: 600 }}><Icon type="environment-o" />收货地址 默认</div>
                    <div>{item.province} {item.city} {item.area}</div>
                    <div>{item.address}</div>
                    <br />
                  </div>
                )}
              />
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
