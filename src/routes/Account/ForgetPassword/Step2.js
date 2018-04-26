import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Alert, Divider } from 'antd';
import { routerRedux } from 'dva/router';
import styles from './Style.less';

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

@connect(({ forgetpassword, loading }) => ({
  submitting: loading.effects['forgetpassword/submitStepForm'],
  email: forgetpassword.email,
  validating: forgetpassword.userValidating,
}))
@Form.create()
export default class Step2 extends React.PureComponent {
  state = {
    token: null,
    objectid: null,
    username: null,
  };

  // Todo componentWillMount
  componentWillMount() {
    // const { dispatch, location } = this.props;
    // dispatch({
    //   type: '',
    //   payload: location.search,
    // });
    const userName = this.getUrlPara('username');
    if (userName !== null) {
      this.props.dispatch({
        type: 'forgetpassword/validate',
        payload: {
          username: userName,
        },
      });
    }
    this.setState({
      token: this.getUrlPara('token'),
    });
  }
  // Todo componentWillReceiveProps
  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps');
    if (nextProps.validating.results !== undefined && nextProps.validating.results.length > 0) {
      this.setState({
        token: this.getUrlPara('token'),
        objectid: nextProps.validating.results[0].objectId,
        username: nextProps.validating.results[0].username,
      });
    } else {
      this.setState({
        token: null,
        objectid: null,
        username: null,
      });
    }
  }

  getUrlPara = (name) => {
    const { location } = this.props;
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
    const r = location.search.substr(1).match(reg);
    if (r != null) {
      return (r[2]);
    }
    return null;
  }

  getInfo = () => {
    const token = this.getUrlPara('token');
    const userName = this.getUrlPara('username');
    if (token !== null && token.length > 0 && userName !== null && userName.length > 0) {
      return '已接收到重置密码请求，请输入密码进行重置密码。';
    } else {
      return '验证失败！请重新发送重置密码请求。';
    }
  }

  render() {
    const { form, dispatch, submitting } = this.props;
    const { getFieldDecorator, validateFields } = form;
    const onPrev = () => {
      dispatch(routerRedux.push('/account/forgetpassword'));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      validateFields((err, values) => {
        if (!err) {
          dispatch({
            type: 'forgetpassword/submitPasswordReset',
            payload: {
              objectId: this.state.objectid,
              data: {
                ...values,
              },
            },
          });
        }
      });
    };

    return (
      <Form layout="horizontal" className={styles.stepForm}>
        <Alert
          closable
          showIcon
          message={this.getInfo()}
          style={{ marginBottom: 24 }}
        />
        <Form.Item
          {...formItemLayout}
          className={styles.stepFormText}
          label="帐号"
        >
          { this.state.username }
        </Form.Item>
        <Divider style={{ margin: '24px 0' }} />
        <Form.Item
          {...formItemLayout}
          label="新密码"
          required={false}
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: '请输入新密码',
            }],
          })(
            <Input type="password" autoComplete="off" style={{ width: '80%' }} />
          )}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label="确认新密码"
          required={false}
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: '请输入新密码',
            }],
          })(
            <Input type="password" autoComplete="off" style={{ width: '80%' }} />
          )}
        </Form.Item>
        <Form.Item
          style={{ marginBottom: 8 }}
          wrapperCol={{
            xs: { span: 24, offset: 0 },
            sm: { span: formItemLayout.wrapperCol.span, offset: formItemLayout.labelCol.span },
          }}
          label=""
        >
          <Button onClick={onPrev}>
            上一步
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            style={{ marginLeft: 20 }}
          >
            提交
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
