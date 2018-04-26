import React, { PureComponent } from 'react';
import { Input, Modal, Form, Select } from 'antd';

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
      validateDistrictNo: this.props.validateDistrictNo,
      districtNo: this.props.districtNo,
      districtName: this.props.districtName,
      pointerbrand: this.props.pointerbrand === undefined ? '' : this.props.pointerbrand.objectId,
      pointerregion: this.props.pointerregion === undefined ? '' : this.props.pointerregion.objectId,
    };
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      districtNo: nextProps.districtNo,
      districtName: nextProps.districtName,
      pointerbrand: nextProps.pointerbrand === undefined ? '' : nextProps.pointerbrand.objectId,
      pointerregion: nextProps.pointerregion === undefined ? '' : nextProps.pointerregion.objectId,
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
    const { form, handleEdit, districtNo, handleAdd } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (districtNo !== '') {
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
    const { option, option2 } = this.props;
    const { districtNo, districtName,
      title, modalVisible, validateDistrictNo, pointerbrand, pointerregion } = this.state;


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
          getFieldDecorator('districtNo', {
            rules: [{ required: true, message: '请输入编号...' }, { fieldname: 'districtNo', required: true, message: '该编号已存在', validator: validateDistrictNo }],
            validateFirst: true,
            validateTrigger: 'onBlur',
            initialValue: districtNo,
          })(
            <Input placeholder="请输入" />
            )
          }
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="区域名称"
        >
          {
              getFieldDecorator('districtName', {
                rules: [{ required: true, message: '请输入区域名称...' }],
                initialValue: districtName,
              })(
                <Input placeholder="请输入" />
              )
          }
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="关联品牌"
        >
          {getFieldDecorator('brandName', {
            rules: [{ required: true, message: '请选择关联品牌...' }],
            initialValue: pointerbrand,
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
            >
              { option.map(d => (
                <Select.Option key={d.objectId} value={d.objectId} >
                  {d.brandName}
                </Select.Option>
))
              }
            </Select>
          )}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="关联大区"
        >
          {getFieldDecorator('regionName', {
            rules: [{ required: true, message: '请选择关联大区...' }],
            initialValue: pointerregion,
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
              // value={pointerregion}
            >
              { option2.map(d => (
                <Select.Option key={d.objectId} value={d.objectId} >
                  {d.regionName}
                </Select.Option>
)) }
            </Select>
          )}
        </FormItem>
      </Modal>
    );
  }
}
