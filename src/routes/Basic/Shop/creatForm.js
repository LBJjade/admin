/* eslint-disable indent,no-unused-vars,no-undef,no-trailing-spaces,react/no-multi-comp,react/jsx-boolean-value,max-len,prefer-destructuring,padded-blocks,react/no-unused-state,quotes,react/no-unescaped-entities,no-extra-semi */
import React, { PureComponent } from 'react';
import { Input, Modal, Form, Upload, Icon, Select } from 'antd';
import { stringify } from 'qs';

const FormItem = Form.Item;
const { Option } = Select;
const SelectOption = Select.Option;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error('You can only upload JPG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJPG && isLt2M;
}

class Avatar extends React.Component {
  state = {
    loading: false,
  };
  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => this.setState({
        imageUrl,
        loading: false,
      }));
    }
  }
  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const imageUrl = this.state.imageUrl;
    return (
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={true}
        action="http://localhost:80/upload/webUploader/img"
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
      >
        {imageUrl ? <img src={imageUrl} alt="" /> : uploadButton}
      </Upload>
    );
  }
}

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
      validateShopNo: this.props.validateShopNo,
      shopNo: this.props.shopNo,
      shopName: this.props.shopName,
      contactTel: this.props.contactTel,
      address: this.props.address,
    };
  };

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    this.setState({
      shopNo: nextProps.shopNo,
      shopName: nextProps.shopName,
      contactTel: nextProps.contactTel,
      address: nextProps.address,
      modalVisible: nextProps.modalVisible,
      title: nextProps.title,
    });
  };

  onclose = () => {
    const { handleModalVisible } = this.state;
    handleModalVisible(false);
    this.props.form.resetFields();
  };

  okHandle = () => {
    const { form, title, handleEdit, shopNo, handleAdd } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (shopNo !== "") {
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
    const { brands, regions, districts } = this.props;
    const { shopNo, shopName, title, modalVisible, validateShopNo, contactTel, address } = this.state;

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
            getFieldDecorator('shopNo', {
              rules: [{ required: true, message: '请输入编号...' }, { fieldname: 'shopNo', required: true, message: '该编号已存在', validator: validateShopNo }],
              validateFirst: true,
              validateTrigger: 'onBlur',
              initialValue: shopNo,
            })(
              <Input placeholder="请输入" />
            )
          }
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="门店名称"
        >
          {
            getFieldDecorator('shopName', {
              rules: [{ required: true, message: '请输入门店名称...' }],
              initialValue: shopName,
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
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
            >
              {brands.map(d => <SelectOption key={d.objectId} value={d.brandName} >{d.brandName}</SelectOption>)}
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
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
            >
              {regions.map(d => <SelectOption key={d.objectId} value={d.regionName} >{d.regionName}</SelectOption>)}
            </Select>
          )}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="关联小区"
        >
          {getFieldDecorator('districtName', {
            rules: [{ required: true, message: '请选择关联小区...' }],
          })(
            <Select
              placeholder="请选择"
              style={{ width: '100%' }}
            >
              {districts.map(d => <SelectOption key={d.objectId} value={d.districtName} >{d.districtName}</SelectOption>)}
            </Select>
          )}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="联系电话"
        >
          {getFieldDecorator('contactTel', {
            rules: [{ required: true, message: '请输入联系电话...' }],
            initialValue: contactTel,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>
        <FormItem
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 15 }}
          label="门店地址"
        >
          {getFieldDecorator('address', {
            rules: [{ required: true, message: '请输入门店地址...' }],
            initialValue: address,
          })(
            <Input placeholder="请输入" />
          )}
        </FormItem>
      </Modal>
    );
  }
}
