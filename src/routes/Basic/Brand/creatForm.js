import React, { PureComponent } from 'react';
import { Input, Modal, Form } from 'antd';

const FormItem = Form.Item;

@Form.create()
export default class CreateForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: this.props.modalVisible,
      handleAdd: this.props.handleAdd,
      handleEdit: this.props.handleEdit,
      handleModalVisible: this.props.handleModalVisible,
      title: this.props.title,
      form: this.props.form,
      validateBrandNo: this.props.validateBrandNo,
      brandNo: this.props.brandNo,
      brandName: this.props.brandName,
    };
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      brandNo: nextProps.brandNo,
      brandName: nextProps.brandName,
      modalVisible: nextProps.modalVisible,
      title: nextProps.title,
    });
  }

  onclose = () => {
    const { handleModalVisible } = this.state;
    handleModalVisible(false);
    this.props.form.resetFields();
  };

  okHandle = () => {
    const { form, handleEdit, brandNo, handleAdd } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (brandNo !== '') {
        handleEdit(fieldsValue);
        this.props.form.resetFields();
      } else {
        handleAdd(fieldsValue);
        this.props.form.resetFields();
      }
    });
  };


  render() {
    const { getFieldDecorator } = this.props.form;
    const { brandNo, brandName, title, modalVisible, validateBrandNo } = this.state;


    return (
      <Modal
        title={title}
        visible={modalVisible}
        onOk={this.okHandle}
        onCancel={() => this.onclose()}
      >
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="编号"
        >
          {
          getFieldDecorator('brandNo', {
            rules: [{ required: true, message: '请输入编号...' }, { fieldname: 'brandNo', required: true, message: '该编号已存在', validator: validateBrandNo }],
            validateFirst: true,
            validateTrigger: 'onBlur',
            initialValue: brandNo,
          })(
            <Input placeholder="请输入" />
            )
          }
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="品牌名称"
        >
          {
              getFieldDecorator('brandName', {
                rules: [{ required: true, message: '请输入品牌名称...' }],
                initialValue: brandName,
              })(
                <Input placeholder="请输入" />
              )
          }
        </FormItem>
      </Modal>
    );
  }
}
