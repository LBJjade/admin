import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Form, Input, Button, Select, Row, Col, Popover, Progress, Icon } from 'antd';
import styles from './Signup.less';

const { Item } = Form;
const { Option } = Select;
const { Group } = Input;

const passwordStatusMap = {
  ok: <div className={styles.success}>强度：强</div>,
  pass: <div className={styles.warning}>强度：中</div>,
  poor: <div className={styles.error}>强度：太短</div>,
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

@connect(({ signup, loading }) => ({
  signup,
  submitting: loading.effects['register/submit'],
  validating: signup.userValidating,
  existUsername: signup.existUsername,
  existEmail: signup.existEmail,
  existMobile: signup.existMobile,
  res: signup.res,
}))
@Form.create()
export default class Signup extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',
    submitComplete: false,
  };

  componentWillReceiveProps(nextProps) {
    const email = this.props.form.getFieldValue('email');
    if (nextProps.signup.res.sessionToken !== undefined && this.state.submitComplete) {
      this.props.dispatch(routerRedux.push({
        pathname: '/account/signup-result',
        state: {
          email,
        },
      }));
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGetCaptcha = () => {
    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  handleValidate = (rule, value, callback) => {
    if (rule.fieldname !== undefined) {
      if (!value) {
        callback([new Error(rule.message)]);
      } else {
        if (rule.fieldname === 'username') {
          this.props.dispatch({
            type: 'signup/existUsername',
            // payload: { username: value },
            payload: { where: { username: { $regex: `^${value}$`, $options: 'i', }, }, },
          }).then(() => {
            if (this.props.existUsername.results.length > 0) {
              callback([new Error(rule.message)]);
            } else {
              callback();
            }
          });
        }
        if (rule.fieldname === 'email') {
          this.props.dispatch({
            type: 'signup/existEmail',
            // payload: { email: value },
            payload: { where: { email: { $regex: `^${value}$`, $options: 'i', }, }, },
          }).then(() => {
            if (this.props.existEmail.results.length > 0) {
              callback([new Error(rule.message)]);
            } else {
              callback();
            }
          });
        }
        if (rule.fieldname === 'mobile') {
          this.props.dispatch({
            type: 'signup/existMobile',
            // payload: { mobile: value },
            payload: { where: { mobile: value }, },
          }).then(() => {
            if (this.props.existMobile.results.length > 0) {
              callback([new Error(rule.message)]);
            } else {
              callback();
            }
          });
        }
        // setTimeout(() => {
        //   if (this.props.validating.results.length > 0) {
        //     callback([new Error(rule.message)]);
        //   } else {
        //     callback();
        //   }
        // }, 8000);
        // if (this.props.validating.results !== undefined) {
        //   if (this.props.validating.results.length > 0) {
        //     callback([new Error(rule.message)]);
        //   } else {
        //     callback();
        //   }
        // }
      }
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      // if (err === null || !err) {
      if (err === null || !err) {
        this.props.dispatch({
          type: 'signup/submit',
          payload: {
            ...values,
            prefix: this.state.prefix,
          },
        });
        this.setState({ submitComplete: true });
      }
    });
  };

  // handleConfirmBlur = (e) => {
  //   const { value } = e.target;
  //   this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  // };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: '请输入密码！',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
    callback();
  };

  changePrefix = (value) => {
    this.setState({
      prefix: value,
    });
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles['progress-'+passwordStatus]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { count, prefix } = this.state;

    return (
      <div className={styles.main}>
        <h3>注册</h3>
        <Form onSubmit={this.handleSubmit}>
          <Item>
            {getFieldDecorator('username', {
              rules: [
                { fieldname: 'username', required: true, message: '请输入帐号！' },
                { fieldname: 'username', required: true, min: 3, message: '帐号长度不能小于 3 ！' },
                { fieldname: 'username', required: true, message: '该帐号已被使用。', validator: this.handleValidate },
              ],
              validateFirst: true,
              validateTrigger: 'onChange',
            })(<Input size="large" placeholder="帐号" prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} />)}
          </Item>
          <Item>
            {getFieldDecorator('email', {
              rules: [
                { fieldname: 'email', required: true, message: '请输入邮箱地址！' },
                { fieldname: 'email', required: true, type: 'email', message: '邮箱地址格式错误！' },
                { fieldname: 'email', required: true, message: '该邮箱已被注册。', validator: this.handleValidate },
              ],
              validateFirst: true,
              validateTrigger: 'onBlur',
            })(<Input size="large" placeholder="邮箱" prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} />)}
          </Item>
          <Item help={this.state.help}>
            <Popover
              content={
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[this.getPasswordStatus()]}
                  {this.renderPasswordProgress()}
                  <div style={{ marginTop: 10 }}>
                    请至少输入 6 个字符。请不要使用容易被猜到的密码。
                  </div>
                </div>
              }
              overlayStyle={{ width: 240 }}
              placement="right"
              visible={this.state.visible}
            >
              {getFieldDecorator('password', {
                rules: [
                  {
                    validator: this.checkPassword,
                  },
                ],
              })(
                <Input
                  size="large"
                  type="password"
                  placeholder="至少6位密码，区分大小写"
                  prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
              )}
            </Popover>
          </Item>
          <Item>
            {getFieldDecorator('confirm', {
              rules: [
                {
                  required: true,
                  message: '请确认密码！',
                },
                {
                  validator: this.checkConfirm,
                },
              ],
            })(
              <Input
                size="large"
                type="password"
                placeholder="确认密码"
                prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />
            )}
          </Item>
          <Item>
            <Group compact>
              <Select
                size="large"
                value={prefix}
                onChange={this.changePrefix}
                style={{ width: '20%' }}
              >
                <Option value="86">+86</Option>
                <Option value="87">+87</Option>
              </Select>
              {getFieldDecorator('mobile', {
                rules: [
                  { fieldname: 'mobile', required: true, message: '请输入手机号！' },
                  { fieldname: 'mobile', required: true, pattern: /^1\d{10}$/, message: '手机号格式错误！' },
                  { fieldname: 'mobile', required: true, message: '该手机号码已被注册', validator: this.handleValidate },
                ],
                validateFirst: true,
                validateTrigger: 'onBlur',
              })(
                <Input
                  size="large"
                  style={{ width: '80%' }}
                  placeholder="手机号码"
                />
              )}
            </Group>
          </Item>
          <Item>
            <Row gutter={8}>
              <Col span={16}>
                {getFieldDecorator('captcha', {
                  rules: [
                    {
                      required: true,
                      message: '请输入验证码！',
                    },
                  ],
                })(<Input size="large" placeholder="验证码" />)}
              </Col>
              <Col span={8}>
                <Button
                  size="large"
                  disabled={count}
                  className={styles.getCaptcha}
                  onClick={this.onGetCaptcha}
                >
                  {count ? `${count} s` : '获取验证码'}
                </Button>
              </Col>
            </Row>
          </Item>
          <Item>
            <Button
              size="large"
              loading={submitting}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              注册
            </Button>
            <Link className={styles.login} to="/account/login">
              使用已有账户登录
            </Link>
          </Item>
        </Form>
      </div>
    );
  }
}
