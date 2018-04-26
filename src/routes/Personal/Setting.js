import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Avatar, Row, Col, Card, Input, Icon, Select, Upload, message, Button, Divider } from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Setting.less';


@connect(({ account }) => ({
  account,
  loading: account.loading,
  currentUser: account.currentUser,
  existEmail: account.existEmail,
  existMobile: account.existMobile,
}))
@Form.create()
export default class Setting extends Component {
  state = {
    uploading: false,
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (err === null || !err) {
        this.props.dispatch({
          type: 'account/coverUser',
          payload: {
            ...values,
            objectId: this.props.currentUser.objectId,
          },
        });
      }
    });
  };

  handleValidate = (rule, value, callback) => {
    if (rule.fieldname !== undefined) {
      if (!value) {
        callback([new Error(rule.message)]);
      } else {
        if (rule.fieldname === 'email') {
          this.props.dispatch({
            type: 'account/existEmail',
            // payload: { email: value },
            payload: {
              where: {
                objectId: { $ne: this.props.currentUser.objectId },
                email: { $regex: `^${value}$`, $options: 'i' },
              },
            },
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
            type: 'account/existMobile',
            // payload: { mobile: value },
            payload: {
              where: {
                objectId: { $ne: this.props.currentUser.objectId },
                mobile: value,
              },
            },
          }).then(() => {
            if (this.props.existMobile.results.length > 0) {
              callback([new Error(rule.message)]);
            } else {
              callback();
            }
          });
        }
      }
    }
  };

  beforeUpload = (file) => {
    const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');
    if (!isJPG) {
      message.error('只能上传图片文件！');
    }
    // const isLt2M = file.size / 1024 / 1024 < 2;
    // if (!isLt2M) {
    //   message.error('Image must smaller than 2MB!');
    // }
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
      message.error('图片大小必须小于1MB！');
    }
    return isJPG && isLt2M;
  };

  handleSuccess = (response) => {
    const { currentUser, dispatch } = this.props;
    const avatarUrl = response.url;

    if (currentUser.avatar) {
      const filename = currentUser.avatar.substr(currentUser.avatar.lastIndexOf('/') + 1);
      dispatch({
        type: 'account/removeFile',
        payload: filename,
      });
    }

    if (avatarUrl) {
      dispatch({
        type: 'account/coverUser',
        payload: {
          avatar: response.url,
          objectId: currentUser.objectId,
        },
      });
    }
  };

  customRequest = ({ onSuccess, onError, file }) => {
    const reader = new FileReader();

    reader.onloadstart = () => {
      // 这个事件在读取开始时触发
    };

    // reader.onprogress = (p) => {
    //   // 这个事件在读取进行中定时触发
    // };

    reader.onload = () => {
      // 这个事件在读取成功结束后触发
    };

    reader.onloadend = () => {
      // 这个事件在读取结束后，无论成功或者失败都会触发
      if (reader.error) {
        onError(reader.error);
      } else {
        // 构造 XMLHttpRequest 对象，发送文件 Binary 数据
        const xhr = new XMLHttpRequest();
        const newFilename = (name) => {
          const ext = name.lastIndexOf('.');
          const newname = moment(new Date()).format('YYMMDD');

          return `${newname}${name.substring(ext)}`;
        };
        xhr.open(
          /* method */ 'POST',
          /* target url */ `/api/files/${newFilename(file.name)}`
        );
        xhr.overrideMimeType('application/octet-stream');
        xhr.setRequestHeader('X-Parse-Application-Id', 'bee');
        xhr.responseType = 'json';
        if (!XMLHttpRequest.prototype.sendAsBinary) {
          const buffer = (datastr) => {
            function byteValue(x) {
              return x.charCodeAt(0) & 0xff;
            }
            const ords = Array.prototype.map.call(datastr, byteValue);
            const ui8a = new Uint8Array(ords);
            return ui8a.buffer;
          };
          xhr.send(buffer(reader.result));
        } else {
          xhr.sendAsBinary(reader.result);
        }
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
              onSuccess(xhr.response);
            }
          }
        };
      }
    };

    reader.readAsBinaryString(file);
  };

  render() {
    const { form, currentUser, loading } = this.props;
    const { getFieldDecorator } = form;
    const { avatar } = currentUser;

    const uploadButton = (
      <div>
        <Icon type={this.state.uploading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    const submitFormLayout = {
      wrapperCol: { span: 24, offset: 6 },
    };

    return (
      <PageHeaderLayout
        title="个人设置"
        logo={<Avatar src={avatar} />}
      >
        <Card title="基础设置">
          <Row gutter={24}>
            <Form onSubmit={this.handleSubmit}>
              <Form.Item {...formItemLayout} label="注册邮箱：">
                <Icon type="mail" style={{ margin: 10 }} />{ currentUser.email || '' }
              </Form.Item>
              <Divider />
              <Col xl={4} lg={24} md={24} sm={24} xs={24}>
                <Card bordered={false}>
                  <Upload
                    name="avatar"
                    accept="image/*"
                    listType="picture-card"
                    showUploadList={false}
                    className={styles.uploader}
                    onChange={this.handleChange}
                    beforeUpload={this.beforeUpload}
                    customRequest={this.customRequest}
                    onSuccess={this.handleSuccess}
                  >
                    {avatar ? <img src={avatar} alt="" style={{ width: 128, height: 128 }} /> : uploadButton}
                  </Upload>
                </Card>
              </Col>
              <Col xl={20} lg={24} md={24} sm={24} xs={24}>
                <Form.Item {...formItemLayout} label="昵称：">
                  { getFieldDecorator('nickname', {
                    initialValue: currentUser.nickname || '',
                    rules: [
                      { fieldname: 'nickname', required: false, min: 3, message: '昵称长度不能小于 3 ' },
                    ],
                  })(
                    <Input
                      placeholder={currentUser.nickname || '请输入您的昵称.'}
                      prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    />)}
                </Form.Item>
                <Form.Item {...formItemLayout} label="手机号码">
                  <Input.Group compact>
                    <Select
                      value="86"
                      style={{ width: '20%' }}
                    >
                      <Select.Option value="86">+86</Select.Option>
                      <Select.Option value="87">+87</Select.Option>
                    </Select>
                    {getFieldDecorator('mobile', {
                      initialValue: currentUser.mobile || '',
                      rules: [
                        { fieldname: 'mobile', required: true, message: '请输入手机号！' },
                        { fieldname: 'mobile', required: true, pattern: /^1\d{10}$/, message: '手机号格式错误！' },
                        { fieldname: 'mobile', required: true, message: '该手机号码已被注册', validator: this.handleValidate },
                      ],
                      validateFirst: true,
                      validateTrigger: 'onBlur',
                    })(
                      <Input
                        style={{ width: '80%' }}
                        placeholder={currentUser.mobile || '请输入您的手机号码.'}
                      />
                    )}
                  </Input.Group>
                </Form.Item>
                <Form.Item {...submitFormLayout} style={{ marginTop: 32 }}>
                  <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
                </Form.Item>
              </Col>
            </Form>
          </Row>
        </Card>
      </PageHeaderLayout>
    );
  }
}
