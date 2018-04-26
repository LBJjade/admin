import React, { Component } from 'react';
import { Form, Modal, Button, Input, message} from 'antd';

@Form.create()
export default class CityModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: props.visible,
      cityModal: props.cityModal,
    };
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.value.visible,
      cityModal: {
        visible: nextProps.value.visible,
        objectId: nextProps.value.objectId,
        cityNo: nextProps.value.cityNo,
        cityName: nextProps.value.cityName,
      },
    });
  };

  onOk = (e) => {
    // e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (err === null || !err) {
        this.props.onOk(values);
      }
    });
  };

  onClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };


  render() {
    const { getFieldDecorator	} = this.props.form;
    const visible = this.props.visible;
    const { cityModal } = this.props;

    return (
      <Modal
        title="Basic Modal"
        visible={visible}
        onOk={this.onOk}
        onCancel={this.onClose}
      >
        <Form>
          { getFieldDecorator('objectId', {
              initialValue: cityModal.objectId,
            })(
              <Input type='hidden'/>
            )}
          <Form.Item label='城市编号' >
            { getFieldDecorator('cityNo', {
              initialValue: cityModal.cityNo,
            })(
              <Input />
            )	}
          </Form.Item>
          <Form.Item label='城市名称'>
            { getFieldDecorator('cityName', {
              initialValue: cityModal.cityName,
            })(
              <Input />
            )	}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
