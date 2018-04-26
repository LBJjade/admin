import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Divider, Icon } from 'antd';
import styles from './Style.less';

const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

@connect(({ forgetpassword }) => ({
  data: forgetpassword.step,
  // validating: forgetpassword.userValidating,
  existEmail: forgetpassword.existEmail,
}))
@Form.create()
export default class Step1 extends React.PureComponent {
  state = {
    // verify: 'email',
  };

  handleValidate = (rule, value, callback) => {
    if (rule.fieldname !== undefined) {
      if (!value) {
        callback([new Error(rule.message)]);
      } else {
        if (rule.fieldname === 'email') {
          this.props.dispatch({
            type: 'forgetpassword/existEmail',
            payload: { where: { email: { $regex: `^${value}$`, $options: 'i', }, }, },
          }).then(() => {
            if (this.props.existEmail.results.length <= 0) {
              callback([new Error(rule.message)]);
            } else {
              callback();
            }
          });
        }
      }
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'forgetpassword/submitEmail',
          payload: values,
        });
      }
    });
  };
  render() {
    const { form, email } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div>
        <Form layout="horizontal" className={styles.stepForm} hideRequiredMark>
          <Form.Item
            {...formItemLayout}
            label="注册邮箱"
          >
            {getFieldDecorator('email', {
              initialValue: email,
              rules: [
                { fieldname: 'email', required: true, message: '请输入邮箱地址！' },
                { fieldname: 'email', required: true, type: 'email', message: '邮箱地址格式错误！' },
                { fieldname: 'email', required: true, message: '该邮箱未注册。', validator: this.handleValidate },
              ],
              validateFirst: true,
              validateTrigger: 'onBlur',
            })(
              <Input placeholder="请输入您的注册邮箱" prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} />
            )}
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: { span: 24, offset: 0 },
              sm: { span: formItemLayout.wrapperCol.span, offset: formItemLayout.labelCol.span },
            }}
            label=""
          >
            <Button type="primary" onClick={this.handleSubmit}>
              下一步
            </Button>
          </Form.Item>
        </Form>
        <Divider style={{ margin: '40px 0 24px' }} />
      </div>
    );
  }
}

