import React from 'react';
import { Upload, Modal, Icon, message, Tooltip } from 'antd';
import moment from 'moment';
import styles from './index.less';
import globalConfig from '../../config';

export default class UploadImage extends React.PureComponent {
  state = {
    fileList: this.props.fileList,
  };

  handleImgCancel = () => {
    this.setState({ img: { previewVisible: false } });
  };

  handleImgPreview = (file) => {
    this.setState({
      img: {
        previewImage: file.url || file.thumbUrl,
        previewVisible: true,
      },
    });
  };

  handleImgChange = ({ fileList }) => {
    this.setState({ img: { fileList: fileList } });
  };

  handleImgRemove = (file) => {
    console.log(file);
  };

  handleImgBeforeUpload = (file) => {
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

  handleImgCustomRequest = ({ onSuccess, onError, file }) => {
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
              onSuccess(xhr.response);
            }
          }
        };
      }
    };

    reader.readAsBinaryString(file);
  };

  handleImgUploadSuccess = (response) => {
    console.log(response);
    if (this.props.onSuccess) {
      this.props.onSuccess(response);
    }
  };

  render() {
    const { listType } = this.props;
    const { defaultFileList } = this.props;
    // const { fileList } = this.props;
    const { limitFileCount } = this.props;
    const { tooltip } = this.props;

    const { fileList } = this.state;

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
          defaultFileList={defaultFileList}
          fileList={fileList}
          beforeUpload={this.handleImgBeforeUpload}
          customRequest={this.handleImgCustomRequest}
          onSuccess={respon => this.handleImgUploadSuccess(respon)}
          onPreview={this.handleImgPreview}
          onChange={this.handleImgChange}
          onRemove={this.handleImgRemove}
        >
          { limitFileCount ? (fileList && fileList.length > limitFileCount ? null : uploadButton) : uploadButton }
        </Upload>
        <Modal visible={false} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src="" />
        </Modal>
      </div>
    );
  }
}
