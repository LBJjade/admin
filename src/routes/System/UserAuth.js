/* eslint-disable prefer-destructuring */
import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import { Form, Input, Button, Card, Tag, Tooltip, Row, Col, Select, List, Icon } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ account }) => ({
  account,
}))
@Form.create()
export default class BasicForms extends PureComponent {
  state = {
  };
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
      type: 'account/fetchUserAuth',
      payload: {
        where: {
          pointerUser: {
            __type: 'Pointer',
            className: '_User',
            objectId: this.props.match.params.id,
          },
        },
      },
    });
    dispatch({
      type: 'account/fetchAddress',
      payload: {
        where: {
          pointerUser: {
            __type: 'Pointer',
            className: '_User',
            objectId: this.props.match.params.id,
          },
        },
      },
    });
  }
  handleSubmit = (e, id) => {
    const { dispatch } = this.props;
    e.preventDefault();
    if (id !== '') {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          dispatch({
            type: 'account/coverUserAuth',
            payload: {
              values,
              tags: values.tags,
              objectId: id,
            },
          }).then(() => {
            dispatch(routerRedux.push('/system/user'));
          });
        }
      });
    } else {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          dispatch({
            type: 'account/storeUserAuth',
            payload: {
              values,
              tags: values.tags,
              pointerUser: {
                __type: 'Pointer',
                className: '_User',
                objectId: this.props.match.params.id,
              },
            },
          }).then(() => {
            dispatch(routerRedux.push('/system/user'));
          });
        }
      });
    }
  }
  render() {
    const { account: { user, address, auth } } = this.props;
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
        <Row gutter={16}>
          <Col span={12} gutter={16}>
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
                    auth === undefined ? <Tag color="red">未认证</Tag> : <Tag color="blue">已认证</Tag>
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
            <div style={{ height: 16 }} />
            <Card title="收货地址">
              {address.results === undefined || address.results.length === 0 ? (<div style={{ textAlign: 'center' }}>暂无数据</div>) : (
                <div>
                  <List
                    dataSource={address.results}
                    renderItem={item => (
                            (
                              <div>
                                {item.isDefault === 1 ? (
                                  <div style={{ marginBottom: 16 }}>
                                    <Card>
                                      <div>
                                        <div style={{ fontWeight: 450 }}>
                                          <div style={{ fontWeight: 600 }}><Icon type="environment-o" />收货地址 <Tag color="red">默认</Tag></div>
                                          {item.province === undefined ? '' : item.province} {item.city === undefined ? '' : item.city} {item.area === undefined ? '' : item.area}
                                        </div>
                                        <div style={{ fontWeight: 450, color: '#8e8989' }}>{item.address === undefined ? '' : item.address}</div>
                                        <br />
                                      </div>
                                      <div>
                                        {item.realName === undefined ? '' : (
                                          <div>
                                            <div style={{ fontWeight: 600 }}><Icon type="user" />收货人</div>
                                            <div style={{ fontWeight: 450, color: '#8e8989' }}>
                                              {item.realName}
                                            </div>
                                          </div>
                                        )}
                                        <br />
                                      </div>
                                      <div>
                                        {item.mobile === undefined ? '' : (
                                          <div>
                                            <div style={{ fontWeight: 600 }}><Icon type="mobile" />收货人电话</div>
                                            <div style={{ fontWeight: 450, color: '#8e8989' }}>
                                              {item.mobile}
                                            </div>
                                          </div>
                                        )}
                                        <br />
                                      </div>
                                    </Card>
                                  </div>
                                ) : ''}
                              </div>
                            ))}
                  />
                  <List
                    dataSource={address.results}
                    renderItem={item => (
                            (
                              <div>
                                {item.isDefault === 0 ? (
                                  <div style={{ marginBottom: 16 }}>
                                    <Card>
                                      <div>
                                        <div style={{ fontWeight: 450 }}>
                                          <div style={{ fontWeight: 600 }}><Icon type="environment-o" />收货地址</div>
                                          {item.province === undefined ? '' : item.province} {item.city === undefined ? '' : item.city} {item.area === undefined ? '' : item.area}
                                        </div>
                                        <div style={{ fontWeight: 450, color: '#8e8989' }}>{item.address === undefined ? '' : item.address}</div>
                                        <br />
                                      </div>
                                      <div>
                                        {item.realName === undefined ? '' : (
                                          <div>
                                            <div style={{ fontWeight: 600 }}><Icon type="user" />收货人</div>
                                            <div style={{ fontWeight: 450, color: '#8e8989' }}>
                                              {item.realName}
                                            </div>
                                          </div>
                                        )}
                                        <br />
                                      </div>
                                      <div>
                                        {item.mobile === undefined ? '' : (
                                          <div>
                                            <div style={{ fontWeight: 600 }}><Icon type="mobile" />收货人电话</div>
                                            <div style={{ fontWeight: 450, color: '#8e8989' }}>
                                              {item.mobile}
                                            </div>
                                          </div>
                                        )}
                                        <br />
                                      </div>
                                    </Card>
                                  </div>
                                ) : ''}
                              </div>
                            ))}
                  />
                </div>
                    )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="实名认证">
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
                            initialValue: auth === undefined ? '' : auth.authName,
                          })(
                            <Input
                              placeholder="请输入认证姓名"
                              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
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
                            initialValue: auth === undefined ? '' : auth.indentityCard,
                          })(
                            <Input
                              placeholder="请输入身份证号"
                              prefix={<Icon type="idcard" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
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
                            initialValue: auth === undefined ? '' : auth.mobile,
                          })(
                            <Input
                              placeholder="请输入联系手机"
                              prefix={<Icon type="mobile" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
                          )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="联系电话"
                >
                  {getFieldDecorator('tel', {
                            initialValue: auth === undefined ? '' : auth.tel,
                          })(
                            <Input
                              placeholder="请输入联系电话"
                              prefix={<Icon type="phone" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
                          )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="E-mail"
                >
                  {getFieldDecorator('email', {
                            initialValue: auth === undefined ? '' : auth.email,
                          })(
                            <Input
                              placeholder="请输入E-mail"
                              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
                          )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="QQ"
                >
                  {getFieldDecorator('QQ', {
                            initialValue: auth === undefined ? '' : auth.QQ,
                          })(
                            <Input
                              placeholder="请输入QQ"
                              prefix={<Icon type="qq" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
                          )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="微信"
                >
                  {getFieldDecorator('wechat', {
                            initialValue: auth === undefined ? '' : auth.wechat,
                          })(
                            <Input
                              placeholder="请输入微信"
                              prefix={<Icon type="wechat" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            />
                          )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="标签"
                >
                  {getFieldDecorator('tag', {
                    initialValue: auth === undefined ? [] : auth.tag,
                          })(
                            <Select mode="tags" placeholder="请输入标签" prefix={<Icon type="tags" style={{ color: 'rgba(0,0,0,.25)' }} />} />
                          )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="备注"
                >
                  {getFieldDecorator('remark', {
                    initialValue: auth === undefined ? '' : auth.remark,
                  })(
                    <TextArea style={{ minHeight: 32 }} placeholder="请输入备注" rows={4} prefix={<Icon type="tags" style={{ color: 'rgba(0,0,0,.25)' }} />} />
                          )}
                </FormItem>
                <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                  <Button type="primary" style={{ marginRight: 8 }}><Link to="/system/user">返回</Link></Button>
                  <Button type="primary" htmlType="button" onClick={e => this.handleSubmit(e, auth === undefined ? '' : auth.objectId)}>
                            提交
                  </Button>
                </FormItem>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
