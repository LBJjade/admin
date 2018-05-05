import React from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Input, Upload, Icon, message, Button } from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Category.less';
import CategoryTreeSelect from './CategoryTreeSelect';
import CategoryTree from './CategoryTree';

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
@Form.create()
export default class Category extends React.PureComponent {
  state = {
    selectedCategory: undefined,
    selectedKey: '',
    selectedParent: '',
  };

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/fetchCategory',
      payload: { count: true },
    });
  }

  handleSelect = (selectedKeys, e) => {
    if (selectedKeys.length > 0) {
      this.setState({
        selectedCategory: e.selectedNodes[0].props.dataRef,
        selectedKey: selectedKeys[0],
        selectedParent: e.selectedNodes[0].props.dataRef.parentId ? e.selectedNodes[0].props.dataRef.parentId.objectId : '',
      });
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

  handleUploadSuccess = (response) => {
    const { selectedCategory, dispatch } = this.props;
    const thumbUrl = response.url;

    if (selectedCategory.thumb) {
      const filename = selectedCategory.thumb.substr(selectedCategory.thumb.lastIndexOf('/') + 1);
      dispatch({
        type: 'category/removeFile',
        payload: filename,
      });
    }

    if (thumbUrl) {
      dispatch({
        type: 'category/coverCategory',
        payload: {
          thumb: response.url,
          objectId: selectedCategory.objectId,
        },
      });
    }
  };

  Tree = (data) => {
    const val = [];
    if (data) {
      // 删除 所有 children,以防止多次调用；加入key、value、label
      data.forEach((item) => {
        item.title = item.name;
        item.subtitle = (<span>{item.description}</span>);
        item.label = item.name;
        item.key = item.objectId;
        item.value = item.objectId;
        item.expanded = true;

        delete item.children;
      });

      // 将数据存储为 以 objectId 为 KEY 的 map 索引数据列
      const map = {};
      data.forEach((item) => {
        map[item.objectId] = item;
      });

      data.forEach((item) => {
        // 以当前遍历项的parentId,去map对象中找到索引的objectId
        const parent = map[item.parentId ? item.parentId.objectId : undefined];
        // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
        if (parent) {
          (parent.children || (parent.children = [])).push(item);
        } else {
          // 如果没有在map中找到对应的索引objectId,那么直接把 当前的item添加到 val结果集中，作为顶级
          val.push(item);
        }
      });
    }
    return val;
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
    const { getFieldDecorator } = this.props.form;
    const { dataCategory } = this.props.category;
    const dataTree = this.Tree(dataCategory.results);
    const dataTreeSelect = [{
      label: '顶级分类',
      key: 'top',
      value: '',
      children: dataTree,
    }];
    const { selectedCategory, selectedKey, selectedParent } = this.state;
    const thumb = selectedCategory ? selectedCategory.thumb || '' : '';

    const uploadButton = (
      <div>
        <Icon type={this.state.uploading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <PageHeaderLayout
        title="分类管理"
        logo={<img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png" />}
        content="所有商品需归纳分类，提供分类信息的维护及管理。"
      >
        <Row gutter={24}>
          <Col xl={14} lg={24} md={24} sm={24} xs={24}>
            <CategoryTree treeData={dataTree} />
          </Col>
          <Col xl={10} lg={24} md={24} sm={24} xs={24}>
            <Card className={styles.card}>
              <Form>
                <Row>
                  <Form.Item label="父级分类">
                    <CategoryTreeSelect dataTree={dataTreeSelect} value={selectedParent} />
                  </Form.Item>
                </Row>
                <Row>
                  <Form.Item label="分类名称">
                    {getFieldDecorator('name', {
                      rules: [{ required: true, message: '请输入分类名称!' }],
                    })(
                      <Input />
                    )}
                  </Form.Item>
                </Row>
                <Row>
                  <Col xl={8} lg={24} md={24} sm={24} xs={24}>
                    <Form.Item label="分类图片">
                      <Upload
                        name="thumb"
                        accept="image/*"
                        listType="picture-card"
                        showUploadList={false}
                        className={styles.uploader}
                        // onChange={this.handleChange}
                        beforeUpload={this.beforeUpload}
                        customRequest={this.customRequest}
                        onSuccess={this.handleUploadSuccess}
                      >
                        {thumb ? <img src={thumb} alt="" style={{ width: 100, height: 100 }} /> : uploadButton}
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col xl={16} lg={24} md={24} sm={24} xs={24}>
                    <Form.Item label="分类描述">
                      {getFieldDecorator('description', {
                        rules: [{ required: false, message: '请输入分类描述!' }],
                      })(
                        <Input.TextArea autosize={{ minRows: 5, maxRows: 10 }} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Form.Item wrapperCol={{ span: 24, offset: 20 }}>
                    <Button type="primary" htmlType="submit" >保存</Button>
                  </Form.Item>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>

    );
  }
}
