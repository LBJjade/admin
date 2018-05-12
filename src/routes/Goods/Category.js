/* eslint-disable max-len */
import React from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Input, Upload, Icon, message, Button, TreeSelect, Switch, Divider, Dropdown, Menu, Modal, Affix } from 'antd';
import moment from 'moment';
import SortableTree, { getFlatDataFromTree } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Category.less';
import globalConfig from '../../config';

@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.category.data) {
      this.setState({ treeData: this.Tree(nextProps.category.data.results) });
    }
  }

  handleSelect = (selectedKeys, e) => {
    // Todo
  };

  Tree = (data) => {
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
        const parent = map[item.pointerCategory ? item.pointerCategory.objectId : undefined];
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

  handleChangeNode = (treeData) => {
    this.setState({
      treeData,
    });
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
      this.setState({
        selectedNode: rowInfo.node,
        selectedPath: rowInfo.path,
        adding: 'child',
        editing: true,
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
      message.warn('此分类存在子分类，禁止删除！', 5);
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

  // Called after node move operation.
  // ({ treeData: object[], node: object, nextParentNode: object, prevPath: number[] or string[], prevTreeIndex: number, nextPath: number[] or string[], nextTreeIndex: number }): void
  handleMoveNode = (data) => {
    const { treeData, node, nextParentNode } = data;
    const { dispatch } = this.props;
    if (node.pointerCategory && nextParentNode && node.pointerCategory.objectId !== nextParentNode.objectId) {
      // 父节点不同，更新父节点
      dispatch({
        type: 'category/coverCategory',
        payload: {
          objectId: node.objectId,
          pointerCategory: {
            __type: 'Pointer',
            className: 'Category',
            objectId: nextParentNode ? nextParentNode.objectId : '',
          },
        },
      });
    } else {
      // this.handleSort();
      // this.setState({ treeData });
      // 父节点相同
      // const sort = getFlatDataFromTree({
      //   treeData: this.state.treeData,
      //   getKey: n => n.objectId,
      //   getParentKey: n => n.pointerCategory.objectId,
      //   getNodeKey: ({ treeIndex }) => treeIndex,
      // });
      // sort.forEach((item) => {
      //   this.props.dispatch({
      //     type: 'category/coverCategory',
      //     payload: {
      //       objectId: item.node.objectId,
      //       path: item.path,
      //       pathLevel: item.path.length,
      //       pathIndex: item.treeIndex,
      //     },
      //   });
      // });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (err === null || !err) {
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

          this.props.dispatch({
            type: 'category/coverCategory',
            payload: {
              ...values, pointerCategory, pathLevel, thumb,
            },
          }).then(() => {
            this.handleSort();
          });
        } else {
          // 新建节点
          pathLevel = this.state.selectedPath.length;

          this.props.dispatch({
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
          title: '确认删除该分类吗？',
          content: '确认删除将不可恢复；建议设置停用分类。',
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

  handleSort = (force = false) => {
    const sort = getFlatDataFromTree({
      treeData: this.state.treeData,
      getKey: node => node.objectId,
      getParentKey: node => node.pointerCategory.objectId,
      getNodeKey: ({ treeIndex }) => treeIndex,
    });
    // sort.sort((x, y) => {
    //   if (x.treeIndex > y.treeIndex) {
    //     return 1;
    //   } else {
    //     return -1;
    //   }
    // });
    // this.setState({ treeData: sort });
    sort.forEach((item) => {
      if (force || item.node.pathIndex === undefined || item.treeIndex !== item.node.pathIndex || item.node.path === undefined || item.path.toString() !== item.node.path.toString()) {
        this.props.dispatch({
          type: 'category/coverCategory',
          payload: {
            objectId: item.node.objectId,
            path: item.path,
            pathLevel: item.path.length,
            pathIndex: item.treeIndex,
          },
        });
      }
    });
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
    const { data } = this.props.category;
    const categorys = this.Tree(data.results);
    const categorysSelect = [{
      label: '商品分类',
      key: 'top',
      value: '',
      children: categorys,
    }];
    const { editing, adding, selectedNode } = this.state;

    // Img
    const { previewVisible, previewImage, fileList } = this.state.img;

    let title = '编辑分类';
    let category = {
      objectId: '',
      name: '',
      pointerCategory: '',
      thumb: '',
      description: '',
      enabled: true,
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
        };
        title = '新建分类';
        break;
      case 'brother':
        category = {
          objectId: '',
          name: '',
          pointerCategory: selectedNode && selectedNode.pointerCategory ? selectedNode.pointerCategory.objectId || '' : '',
          thumb: '',
          description: '',
          enabled: true,
        };
        title = '新建分类';
        break;
      default:
        category = {
          objectId: selectedNode ? selectedNode.objectId : '',
          name: selectedNode ? selectedNode.name : '',
          pointerCategory: selectedNode && selectedNode.pointerCategory ? selectedNode.pointerCategory.objectId || '' : '',
          thumb: selectedNode ? selectedNode.thumb : '',
          description: selectedNode ? selectedNode.description : '',
          enabled: selectedNode ? selectedNode.enabled : true,
        };
        break;
    }

    const uploadButton = (
      <div>
        <Icon type={this.state.img.uploading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    const newButton = (
      <div>
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={e => this.handleAddBrotherNode(e, null)}
          icon="plus"
        >
          新建分类
        </Button>
      </div>
    );

    return (
      <PageHeaderLayout
        title="分类管理"
        // logo={<img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png" />}
        // content="所有商品需归纳分类，提供分类信息的维护及管理。"
      >
        <Row gutter={24}>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>
            <Row>
              <Card>
                { categorys.length <= 0 ? newButton : '' }
                <div style={{
                  height: 570,
                  // overflow: 'scroll',
                  // background: '#fff',
                  // padding: 10,
                  // margin: 10,
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
                            // trigger={['click']}
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
                  <Button type="primary" icon="bars" onClick={() => this.handleSort(true)}>更新排序</Button>
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
              <Form onSubmit={this.handleSubmit}>
                <Form.Item>
                  {getFieldDecorator('objectId', {
                    initialValue: category.objectId,
                  })(
                    <Input hidden />
                  )}
                </Form.Item>
                <Form.Item label="父级分类" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} >
                  {getFieldDecorator('pointerCategory', {
                    initialValue: category.pointerCategory,
                  })(
                    <TreeSelect treeData={categorysSelect} placeholder="请选择父级分类" disabled />
                  )}
                </Form.Item>
                <Divider dashed />
                <Form.Item label="分类名称" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  {getFieldDecorator('name', {
                    initialValue: category.name,
                  })(
                    <Input placeholder="请输入分类名称" />
                  )}
                </Form.Item>
                <Form.Item label="分类描述" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  {getFieldDecorator('description', {
                    initialValue: category.description,
                  })(
                    <Input.TextArea autosize={{ minRows: 2, maxRows: 5 }} />
                  )}
                </Form.Item>
                <Form.Item label="分类图片" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  <Upload
                    name="thumb"
                    accept="image/*"
                    listType="picture-card"
                    // showUploadList={false}
                    className={styles.uploader}
                    beforeUpload={this.handleImgBeforeUpload}
                    customRequest={this.handleImgCustomRequest}
                    onSuccess={this.handleImgUploadSuccess}
                    fileList={fileList}
                    onPreview={this.handleImgPreview}
                    onChange={this.handleImgChange}
                    onRemove={this.handleImgRemove}
                  >
                    {
                      // category.thumb ? <img src={category.thumb} alt="" style={{ width: 80, height: 80 }} /> : uploadButton
                    }
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
                <Form.Item label="规格模版" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  {getFieldDecorator('pointerSpec', {
                    initialValue: '',
                  })(
                    <TreeSelect />
                  )}
                </Form.Item>
                <Form.Item wrapperCol={{ span: 20, offset: 12 }}>
                  <Button type="default" htmlType="button" onClick={e => this.handleCancelEdit(e)} >取消</Button>
                  <Button type="primary" htmlType="submit" >保存</Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageHeaderLayout>
    );
  }
}
