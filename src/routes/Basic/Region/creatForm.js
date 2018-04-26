import React, { PureComponent } from 'react';
import { Input, Modal, Form, Select } from 'antd';

const FormItem = Form.Item;
const SelectOption = Select.Option;

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
      validateRegionNo: this.props.validateRegionNo,
      regionNo: this.props.regionNo,
      regionName: this.props.regionName,
      pointerbrand: this.props.pointerbrand === undefined ? '' : this.props.pointerbrand.objectId,
    };
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      regionNo: nextProps.regionNo,
      regionName: nextProps.regionName,
      pointerbrand: nextProps.pointerbrand === undefined ? '' : nextProps.pointerbrand.objectId,
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
    const { form, handleEdit, regionNo, handleAdd } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (regionNo !== '') {
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
    const { brands } = this.props;
    const { regionNo, regionName,
      title, modalVisible, validateRegionNo, pointerbrand } = this.state;


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
          getFieldDecorator('regionNo', {
            rules: [{ required: true, message: '请输入编号...' }, { fieldname: 'regionNo', required: true, message: '该编号已存在', validator: validateRegionNo }],
            validateFirst: true,
            validateTrigger: 'onBlur',
            initialValue: regionNo,
          })(
            <Input placeholder="请输入" />
            )
          }
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="大区名称"
        >
          {
              getFieldDecorator('regionName', {
                rules: [{ required: true, message: '请输入大区名称...' }],
                initialValue: regionName,
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
              { brands.map(
                d => (
                  <SelectOption key={d.objectId} value={d.objectId} >
                    {d.brandName}
                  </SelectOption>
)) }
            </Select>
          )}
        </FormItem>
      </Modal>
    );
  }
}
