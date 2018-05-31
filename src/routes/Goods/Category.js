/* eslint-disable max-len */
import React from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Input, Upload, Icon, message, Button, TreeSelect, Switch, Divider, Dropdown, Menu, Modal, Affix, Tooltip } from 'antd';
import moment from 'moment';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Category.less';
import globalConfig from '../../config';

@connect(({ category, loading, spec, categoryspec }) => ({
  category,
  loading: loading.models.category,
  spec,
  categoryspec,
}))
@Form.create()
export default class Category extends React.PureComponent {
  state = {
    treeData: [],
    selectedNode: undefined,
    selectedPath: [],
    editing: false,
    // '': 非新建；'child': 新建子级；'brother': 新建兄弟
    adding: '',
    img: {
      uploading: false,
      previewVisible: false,
      previewImage: '',
      // fileList: [{
      //   uid: -1,
      //   name: 'xxx.png',
      //   status: 'done',
      //   url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      // }],
      fileList: [],
    },
  };

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'category/fetchCategory',
      payload: {
        count: true,
        order: 'pathIndex',
      },
    });
    dispatch({
      type: 'spec/fetchSpec',
      payload: {
        count: true,
        order: 'pathIndex',
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.category.category) {
      const data = nextProps.category.category.results.sort((a, b) => (a.pathIndex > b.pathIndex ? 1 : -1))
      this.setState({ treeData: this.Tree(data) });
    }
  }

  Tree = (data, parentKey = 'pointerCategory') => {
    const val = [];
    if (data) {
      // 删除 所有 children,以防止多次调用；加入key、value、label
      data.forEach((item) => {
        item.title = item.name;
        item.subtitle = (item.description ? (<span className={styles.subtitle}>{item.description}</span>) : '');
        item.label = item.name;
        item.id = item.objectId;
        item.key = item.objectId;
        item.value = item.objectId;
        // item.expanded = true;

        delete item.children;
      });

      // 将数据存储为 以 objectId 为 KEY 的 map 索引数据列
      const map = {};
      data.forEach((item) => {
        map[item.objectId] = item;
      });

      data.forEach((item) => {
        // 以当前遍历项的parentId,去map对象中找到索引的objectId
        const parent = map[item[parentKey] ? item[parentKey].objectId : undefined];
        // 如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
        if (parent) {
          item.key = `${parent.key}-${item.key}`;
          (parent.children || (parent.children = [])).push(item);
        } else {
          // 如果没有在map中找到对应的索引objectId,那么直接把 当前的item添加到 val结果集中，作为顶级
          val.push(item);
        }
      });
    }
    return val;
  };

  handleClickNode = (e, rowInfo) => {
    if (!this.state.editing) {
      this.setState({
        selectedNode: rowInfo.node,
        selectedPath: rowInfo.path,
      });
      this.props.form.resetFields();
    }
  };

  handleAddChildNode = (e, rowInfo) => {
    if (!this.state.editing) {
      if (rowInfo.path.length >= globalConfig.categoryPathLimit) {
        message.warn(`只支持${globalConfig.categoryPathLimit}级类目信息，禁止再新建子级！`);
        return;
      }

      this.setState({
        selectedNode: rowInfo.node,
        selectedPath: rowInfo.path,
        adding: 'child',
        editing: true,
        img: {
          uploading: false,
          previewVisible: false,
          previewImage: '',
          fileList: [],
        },
      });
    }
  };

  handleAddBrotherNode = (e, rowInfo) => {
    if (!this.state.editing) {
      if (rowInfo) {
        this.setState({
          selectedNode: rowInfo.node,
          selectedPath: rowInfo.path,
        });
      }
      this.setState({
        adding: 'brother',
        editing: true,
        img: {
          uploading: false,
          previewVisible: false,
          previewImage: '',
          fileList: [],
        },
      });
    }
  };

  handleEditNode = (e, rowInfo) => {
    if (!this.state.editing) {
      this.setState({
        selectedNode: rowInfo.node,
        selectedPath: rowInfo.path,
        editing: true,
        img: {
          uploading: false,
          previewVisible: false,
          previewImage: '',
          fileList: [],
        },
      });
      if (rowInfo.node.thumb) {
        this.setState({
          img: {
            fileList: [{
              uid: rowInfo.node.thumb,
              name: rowInfo.node.thumb,
              status: 'done',
              url: globalConfig.imageUrl + rowInfo.node.thumb,
            }],
          },
        });
      }
    }
  };

  handleRemoveNode = (e, rowInfo) => {
    // Todo
    const deleteNode = rowInfo.node;
    const file = deleteNode.thumb;
    if (deleteNode.children) {
      message.warn('此类目存在子类目，禁止删除！', 5);
    } else {
      const { dispatch } = this.props;
      dispatch({
        type: 'category/removeCategory',
        payload: {
          objectId: deleteNode.objectId,
        },
      }).then(() => {
        this.handleSort();
        if (file) {
          const filename = file.substr(file.lastIndexOf('/') + 1);
          dispatch({
            type: 'category/removeFile',
            payload: filename,
          });
        }
      });
    }
  };

  handleChangeNode = (treeData) => {
    this.setState({
      treeData,
    });
  };

  // Called after node move operation.
  // ({ treeData: object[], node: object, nextParentNode: object, prevPath: number[] or string[], prevTreeIndex: number, nextPath: number[] or string[], nextTreeIndex: number }): void
  handleMoveNode = (data) => {
    const { node, nextParentNode } = data;
    const { dispatch } = this.props;
    const parentObjectId = node.pointerCategory ? node.pointerCategory.objectId || '' : '';
    const nextParentObjectId = nextParentNode ? nextParentNode.objectId || '' : '';

    // 父节点不同，更新父节点
    if (parentObjectId !== nextParentObjectId) {
      dispatch({
        type: 'category/coverCategory',
        payload: {
          objectId: node.objectId,
          pointerCategory: {
            __type: 'Pointer',
            className: 'Category',
            objectId: nextParentObjectId,
          },
        },
      });
    }
  };

  handleSort = () => {
    const { dispatch } = this.props;
    const { treeData } = this.state;

    let level = 1;
    let sort = 0;
    treeData.forEach((item) => {
      level = 1;

      dispatch({
        type: 'category/coverCategory',
        payload: {
          objectId: item.objectId,
          pathLevel: level,
          pathIndex: sort,
        },
      });
      sort += 1;

      if (item.children) {
        level = 2;
        item.children.forEach((child) => {
          dispatch({
            type: 'category/coverCategory',
            payload: {
              objectId: child.objectId,
              pathLevel: level,
              pathIndex: sort,
            },
          });
          sort += 1;
        });
      }
    });
  };

  handleOK = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (err === null || !err) {
        const { dispatch } = this.props;
        // 置换pointerCategory对象
        const pointerCategory = {
          __type: 'Pointer',
          className: 'Category',
          objectId: values.pointerCategory,
        };

        const { img } = this.state;
        const thumb = img.fileList.length ? img.fileList[0].name || '' : '';

        let pathLevel = this.state.selectedPath.length;

        // 修改节点
        if (values.objectId) {
          if (this.state.adding === 'child') {
            pathLevel = this.state.selectedPath.length + 1;
          }
          if (this.state.adding === 'brother') {
            pathLevel = this.state.selectedPath.length;
          }

          dispatch({
            type: 'category/coverCategory',
            payload: {
              ...values, pointerCategory, pathLevel, thumb,
            },
          });
        } else {
          // 新建节点
          pathLevel = this.state.selectedPath.length;

          dispatch({
            type: 'category/storeCategory',
            payload: {
              ...values, pointerCategory, pathLevel, thumb,
            },
          }).then(() => {
            this.handleSort();
          });
        }

        this.setState({
          editing: false,
          adding: '',
        });
      }
    });
  };

  handleCancelEdit = (e) => {
    e.preventDefault();
    this.setState({
      adding: '',
      editing: false,
    });
  };

  handleClickMenu = (menu, rowInfo) => {
    switch (menu.key) {
      case 'edit':
        this.handleEditNode(menu, rowInfo);
        break;
      case 'add_child':
        this.handleAddChildNode(menu, rowInfo);
        break;
      case 'add_brother':
        this.handleAddBrotherNode(menu, rowInfo);
        break;
      case 'delete':
        Modal.confirm({
          title: '确认删除该类目吗？',
          content: '确认删除将不可恢复；建议设置停用类目。',
          okText: '确定',
          cancelText: '取消',
          okType: 'danger',
          onOk: () => this.handleRemoveNode(menu, rowInfo),
          onCancel() {
            // Exit;
          },
        });
        break;
      default:
    }
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
    this.setState({ img: { fileList } });
  };

  handleImgRemove = (file) => {
    const filename = file.url.substr(file.url.lastIndexOf('/') + 1);
    const { dispatch } = this.props;
    const { selectedNode } = this.state;

    dispatch({
      type: 'category/coverCategory',
      payload: {
        thumb: '',
        objectId: selectedNode.objectId,
      },
    }).then(() => {
      dispatch({
        type: 'category/removeFile',
        payload: filename,
      });
    });
  };

  handleImgBeforeUpload = (file) => {
    const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');
    if (!isJPG) {
      message.error('只能上传图片文件！');
    }
    const isImageLimit = file.size < globalConfig.imageLimit;
    if (!isImageLimit) {
      const limit = (globalConfig.imageLimit / 1024 / 1024, 1).round(1).toString();
      message.error(`图片大小必须小于${limit}MB！`);
    }
    return isJPG && isImageLimit;
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

  handleImgUploadSuccess = (response) => {
    const { dispatch } = this.props;
    const { selectedNode } = this.state;
    const thumb = response.name;

    if (selectedNode && selectedNode.thumb) {
      // 移除原有文件
      dispatch({
        type: 'category/removeFile',
        payload: thumb,
      });
    }

    if (thumb) {
      this.setState({
        img: {
          uploading: false,
          fileList: [{
            uid: thumb,
            name: thumb,
            status: 'done',
            url: globalConfig.imageUrl + thumb,
          }],
        },
      });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const categorys = this.Tree(this.props.category.category.results);
    const categorysSelect = [{
      label: '顶级类目',
      key: 'top',
      value: '',
      children: categorys,
    }];
    const { editing, adding, selectedNode } = this.state;

    const specs = this.Tree(this.props.spec.spec.results, 'pointerSpec');

    // Img
    const { previewVisible, previewImage, fileList } = this.state.img;

    let title = '编辑类目';
    let category = {
      objectId: '',
      name: '',
      pointerCategory: '',
      thumb: '',
      description: '',
      enabled: true,
      categorySpec: [],
    };

    switch (adding) {
      case 'child':
        category = {
          objectId: '',
          name: '',
          pointerCategory: selectedNode ? selectedNode.objectId || '' : '',
          thumb: '',
          description: '',
          enabled: true,
          categorySpec: [],
        };
        title = '新建类目';
        break;
      case 'brother':
        category = {
          objectId: '',
          name: '',
          pointerCategory: selectedNode && selectedNode.pointerCategory ? selectedNode.pointerCategory.objectId || '' : '',
          thumb: '',
          description: '',
          enabled: true,
          categorySpec: [],
        };
        title = '新建类目';
        break;
      default:
        category = {
          objectId: selectedNode ? selectedNode.objectId : '',
          name: selectedNode ? selectedNode.name : '',
          pointerCategory: selectedNode && selectedNode.pointerCategory ? selectedNode.pointerCategory.objectId || '' : '',
          thumb: selectedNode ? selectedNode.thumb : '',
          description: selectedNode ? selectedNode.description : '',
          enabled: selectedNode ? selectedNode.enabled : true,
          categorySpec: selectedNode ? selectedNode.categorySpec : [],
        };
        break;
    }

    const uploadButton = (
      <Tooltip
        title="父类目图尺寸366 x 120，<br>子类目图尺寸48 x 48"
        placement="rightTop"
      >
        <div>
          <Icon type={this.state.img.uploading ? 'loading' : 'plus'} />
          <div className="ant-upload-text">Upload</div>
        </div>
      </Tooltip>
    );

    const newButton = (
      <div>
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={e => this.handleAddBrotherNode(e, null)}
          icon="plus"
        >
          新建类目
        </Button>
      </div>
    );

    return (
      <PageHeaderLayout
        title="商城类目"
        content="商城所有商品需进行统一归类，并指定类目的规格。"
      >
        <Row gutter={24}>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>
            <Row>
              <Card>
                { categorys.length <= 0 ? newButton : '' }
                <div style={{
                  height: 570,
                }}
                >
                  <SortableTree
                    treeData={this.state.treeData}
                    onChange={treeData => this.handleChangeNode(treeData)}
                    onMoveNode={treeData => this.handleMoveNode(treeData)}
                    generateNodeProps={(rowInfo) => {
                      const propsNode = {
                        onClick: event => this.handleClickNode(event, rowInfo),
                        buttons: [
                          <Dropdown
                            overlay={(
                              <Menu onClick={menu => this.handleClickMenu(menu, rowInfo)}>
                                <Menu.Item key="edit">
                                  <Icon type="edit" style={{ margin: 8, cursor: 'pointer' }} />编辑
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="add_child">
                                  <Icon type="plus-square-o" style={{ margin: 8, cursor: 'pointer' }} />新建下级
                                </Menu.Item>
                                <Menu.Item key="add_brother">
                                  <Icon type="plus" style={{ margin: 8, cursor: 'pointer' }} />新建同级
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="delete">
                                  <Icon type="delete" style={{ margin: 8, cursor: 'pointer' }} />删除
                                </Menu.Item>
                              </Menu>)}
                          >
                            <Icon type="ellipsis" style={{ margin: 8, cursor: 'pointer' }} />
                          </Dropdown>,
                        ],
                      };
                      return propsNode;
                    }}
                  />
                </div>
              </Card>
            </Row>
            <Row>
              <div style={{ margin: 10 }}>
                <Affix offsetBottom={0}>
                  <Button type="primary" icon="bars" onClick={() => this.handleSort()}>更新排序</Button>
                </Affix>
              </div>
            </Row>
          </Col>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>
            <Card
              title={title}
              className={styles.card}
              hidden={!editing}
            >
              <Form>
                <Form.Item>
                  {getFieldDecorator('objectId', {
                    initialValue: category.objectId,
                  })(
                    <Input hidden />
                  )}
                </Form.Item>
                <Form.Item label="父级类目" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} >
                  {getFieldDecorator('pointerCategory', {
                    initialValue: category.pointerCategory,
                  })(
                    <TreeSelect treeData={categorysSelect} placeholder="请选择父级类目" disabled />
                  )}
                </Form.Item>
                <Divider dashed />
                <Form.Item label="类目名称" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  {getFieldDecorator('name', {
                    initialValue: category.name,
                    rules: [
                      { required: true, message: '请输入类目名称！' },
                    ],
                  })(
                    <Input placeholder="请输入类目名称" />
                  )}
                </Form.Item>
                <Form.Item label="类目描述" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  {getFieldDecorator('description', {
                    initialValue: category.description,
                  })(
                    <Input.TextArea autosize={{ minRows: 2, maxRows: 5 }} />
                  )}
                </Form.Item>
                <Form.Item label="类目图片" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  <Upload
                    name="thumb"
                    accept="image/*"
                    listType="picture-card"
                    className={styles.uploader}
                    beforeUpload={this.handleImgBeforeUpload}
                    customRequest={this.handleImgCustomRequest}
                    onSuccess={this.handleImgUploadSuccess}
                    fileList={fileList}
                    onPreview={this.handleImgPreview}
                    onChange={this.handleImgChange}
                    onRemove={this.handleImgRemove}
                  >
                    {fileList && fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                  <Modal visible={previewVisible} footer={null} onCancel={() => this.handleImgCancel()}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                  </Modal>
                </Form.Item>
                <Form.Item label="状态" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  {getFieldDecorator('enabled', {
                    valuePropName: 'checked',
                    initialValue: category.enabled,
                  })(
                    <Switch checkedChildren="在用" unCheckedChildren="停用" />
                  )}
                </Form.Item>
                <Divider dashed />
                <Form.Item label="类目规格" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} >
                  {getFieldDecorator('categorySpec', {
                    valuePropName: 'value',
                    initialValue: category.categorySpec,
                  })(
                    <TreeSelect
                      treeData={specs}
                      treeCheckable
                      allowClear
                      showCheckedStrategy={TreeSelect.SHOW_CHILD}
                      placeholder="请选择类目规格"
                    />
                  )}
                </Form.Item>
                <Form.Item wrapperCol={{ span: 20, offset: 12 }}>
                  <Button type="default" htmlType="button" onClick={e => this.handleCancelEdit(e)} >取消</Button>
                  <Button type="primary" htmlType="button" onClick={e => this.handleOK(e)} >保存</Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
