import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Alert, Icon } from 'antd';
import Login from '../../components/Login';
import styles from './Login.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;

@connect(state => ({
  login: state.login,
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: false,
  }

  onTabChange = (type) => {
    this.setState({ type });
  }

  handleSubmit = (err, values) => {
    if (!err) {
      const emailReg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
      if (emailReg.test(values.username)) {
        this.props.dispatch({
          type: 'login/login',
          payload: {
            email: values.username,
            password: values.password,
            emailVerified: true,
          },
        });
      } else {
        this.props.dispatch({
          type: 'login/login',
          payload: {
            username: values.username,
            password: values.password,
            emailVerified: true,
            // type,
          },
        });
      }
    }
  }

  changeAutoLogin = (e) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  }

  renderMessage = (content) => {
    return (
      <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon closable />
    );
  }

  render() {
    const { login } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
        >
          <Tab key="account" tab="帐户密码登录">
            {
              login.status === 'error' &&
              login.type === 'account' &&
              login.submitting === false &&
              this.renderMessage('帐户或密码错误')
            }
            <UserName name="username" placeholder="请输入帐号或邮箱" />
            <Password name="password" placeholder="请输入密码" />
          </Tab>
          <Tab key="mobile" tab="手机号登录">
            {
              login.status === 'error' &&
              login.type === 'mobile' &&
              login.submitting === false &&
              this.renderMessage('验证码错误')
            }
            <Mobile name="mobile" />
            <Captcha name="captcha" />
          </Tab>
          <div className={styles.password}>
            <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin}>自动登录</Checkbox>
            <Link className={styles.forgetpassword} to="/account/forgetpassword">忘记密码</Link>
          </div>
          <Submit loading={login.submitting}>登录</Submit>
          <div className={styles.other}>
            其他登录方式
            <Icon className={styles.icon} type="alipay-circle" />
            <Icon className={styles.icon} type="taobao-circle" />
            <Icon className={styles.icon} type="weibo-circle" />
            <Link className={styles.signup} to="/account/signup">注册账户</Link>
          </div>
        </Login>
      </div>
    );
  }
}
