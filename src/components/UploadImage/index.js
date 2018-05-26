/* eslint-disable no-param-reassign */
import React from 'react';
import { connect } from 'dva';
import { Upload, Modal, Icon, message, Tooltip, Button } from 'antd';
import moment from 'moment';
import styles from './index.less';
import globalConfig from '../../config';

@connect(({ file, loading }) => ({
  file,
  loading: loading.models.file,
}))
export default class UploadImage extends React.PureComponent {
  state = {
    uploading: false,
    fileList: this.props.fileList ? this.props.fileList : [],
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.fileList) {
      this.setState({ fileList: nextProps.fileList });
    }
  }

  handleCancel = () => {
    this.setState({ previewVisible: false });
  };

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  handleRemove = (file) => {
    // const { fileList } = this.state;
    // this.setState({
    //   fileList: [...fileList.filter(i => i.uid !== file.uid)],
    // });
    return true;
  };

  handleChange = (changeValue) => {
    // console.log(fileList);
    const { fileList } = changeValue;
    this.setState({ fileList: [...fileList] });

    // 保证getFieldDecorator能够用valuePropName:'fileList'获取到fileList值
    if (this.props.onChange) {
      this.props.onChange(fileList);
    }
  };

  handleBeforeUpload = (file) => {
    const isImage = (file.type === 'image/jpeg' || file.type === 'image/png');
    if (!isImage) {
      message.error('只能上传图片文件！');
    }
    const isImageLimit = file.size < globalConfig.imageLimit;
    if (!isImageLimit) {
      const limit = (globalConfig.imageLimit / 1024 / 1024, 1).round(1).toString();
      message.error(`图片大小必须小于${limit}MB！`);
    }
    return isImage && isImageLimit;
  };

  handleCustomRequest = ({ onSuccess, onError, file }) => {
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
        xhr.setRequestHeader('X-Parse-Application-Id', globalConfig.appId);
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
              if (this.props.onSuccess) {
                this.props.onSuccess({ file, response: xhr.response });
              }
              onSuccess(xhr.response);
            }
          }
        };
      }
    };

    reader.readAsBinaryString(file);
  };

  render() {
    const { listType } = this.props;
    const { tooltip } = this.props;

    const { fileList, uploading } = this.state;

    const uploadButton = (
      <Tooltip
        title={tooltip}
        placement="rightTop"
      >
        <div>
          <Icon type={this.state.loading ? 'loading' : 'plus'} />
          <div className="ant-upload-text">Upload</div>
        </div>
      </Tooltip>
    );

    return (
      <div>
        <Upload
          className={styles.uploader}
          listType={listType}
          beforeUpload={this.handleBeforeUpload}
          customRequest={this.handleCustomRequest}
          onChange={this.handleChange}
          fileList={this.state.fileList}
          onRemove={this.handleRemove}
        >
          { globalConfig.goodsImagesLimit ? (fileList && fileList.length > globalConfig.goodsImagesLimit ? null : uploadButton) : uploadButton }
        </Upload>
        <Modal visible={false} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src="" />
        </Modal>
      </div>
    );
  }
}
