/* eslint-disable no-param-reassign */
import React from 'react';
import { Upload, Modal, Icon, message, Tooltip, Button } from 'antd';
import moment from 'moment';
import reqwest from 'reqwest';
import styles from './index.less';
import globalConfig from '../../config';

export default class UploadImage extends React.PureComponent {
  state = {
    uploading: false,
    fileList: this.props.defaultFileList ? this.props.defaultFileList : [],
  };

  handleCancel = () => {
    this.setState({ previewVisible: false });
  };

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  handleChange = (fileInfo) => {
    // console.log(fileInfo);
    // this.setState({
    //   fileList: fileInfo.fileList,
    // });
    // if (this.props.onChange) {
    //   this.props.onChange(fileInfo);
    // }
  };

  handleRemove = (file) => {
    // if (this.props.onRemove) {
    //   this.props.onRemove(file);
    // }
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

    // this.setState(({ fileList }) => ({
    //   fileList: [...fileList, file],
    // }));
    // return false;
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
              onSuccess({ file, response: xhr.response });
            }
          }
        };
      }
    };

    reader.readAsBinaryString(file);
  };

  handleUploadStart = () => {
    const { fileList } = this.state;

    this.setState({
      uploading: true,
    });

    setTimeout(() => {
      fileList.map((file) => {
        if (file.status === undefined && file.originFileObj !== undefined) {
          // file.status = 'uploading';
          // 单个上传
          this.handleUpload({
            onSuccess: (respon) => {
              file = { ...file, status: 'done', ...respon };
            },
            onError: (error) => {
              file = { ...file, status: 'error' };
            },
            file: file.originFileObj,
          });
        }
        return file;
      });
    }, 500);

    this.setState({
      uploading: false,
    });
  };

  // 单个图片上传
  handleUpload = ({ onSuccess, onError, file }) => {
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

  handleUploadSuccess = (result) => {
    const { fileList } = this.state;
    const file = fileList.find(item => item.uid === result.file.uid);
    if (file) {
      file.name = result.response.name;
      file.thumbUrl = result.response.url;
      file.status = 'done';
    } else {
      fileList.push({
        uid: result.file.uid,
        name: result.response.name,
        thumbUrl: result.response.url,
        status: 'done',
      });
    }
    console.log(result);
    console.log(fileList);

    // if (this.props.onSuccess) {
    //   this.props.onSuccess(result);
    // }
  };

  render() {
    const { listType } = this.props;
    const { defaultFileList } = this.props;
    const { limitFileCount } = this.props;
    const { tooltip } = this.props;

    const { fileList, uploading } = this.state;


    // const { fileList } = this.props;

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
          beforeUpload={this.handleBeforeUpload}
          customRequest={this.handleCustomRequest}
          onSuccess={result => this.handleUploadSuccess(result)}
          onPreview={this.handlePreview}
          onChange={fileInfo => this.handleChange(fileInfo)}
          onRemove={this.handleRemove}
        >
          { limitFileCount ? (fileList && fileList.length > limitFileCount ? null : uploadButton) : uploadButton }
        </Upload>
        <Modal visible={false} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src="" />
        </Modal>
        <Button
          className={styles.uploadStart}
          type="primary"
          htmlType="button"
          onClick={() => this.handleUploadStart()}
          disabled={this.state.fileList.length === 0}
          loading={uploading}
          hidden
        >
          {uploading ? '正在上传...' : '开始上传' }
        </Button>
      </div>
    );
  }
}
