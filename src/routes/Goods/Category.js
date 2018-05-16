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
    specData: [],
    categoryspecData: [],
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
    if (nextProps.category.data) {
      const data = nextProps.category.data.results.sort((a, b) => (a.pathIndex > b.pathIndex ? 1 : -1))
      this.setState({ treeData: this.Tree(data) });
    }
    if (nextProps.spec.data) {
      this.setState({ specData: this.Tree(nextProps.spec.data.results) });
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
        message.warn(`只支持${globalConfig.categoryPathLimit}级分类信息，禁止再新建子级！`);
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

  handleChangeNode = (treeData) => {
    this.setState({
      treeData,
    });
  };

  // Called after node move operation.
  // ({ treeData: object[], node: object, nextParentNode: object, prevPath: number[] or string[], prevTreeIndex: number, nextPath: number[] or string[], nextTreeIndex: number }): void
  handleMoveNode = (data) => {
    const { treeData, node, nextParentNode } = data;
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

  // handleSort = () => {
  //   const { dispatch } = this.props;
  //   const { treeData } = this.state;
  //   const { data } = this.props;
  //   const flatData = getFlatDataFromTree({
  //     treeData: this.state.treeData,
  //     getKey: node => node.objectId,
  //     getParentKey: node => node.pointerCategory.objectId,
  //     getNodeKey: ({ treeIndex }) => treeIndex,
  //   });
  //   flatData.forEach((item, index, items) => {
  //     const treePath = item.path ? item.path.toString() : '';
  //     const dataPath = item.node.path ? item.node.path.toString() : '';
  //
  //     const node = item
  //
  //     if (item.node.objectId) {
  //       dispatch({
  //         type: 'category/coverCategory',
  //         payload: {
  //           objectId: item.node.objectId,
  //           path: item.path,
  //           pathLevel: item.path.length,
  //           pathIndex: item.treeIndex,
  //         },
  //       });
  //       if (item.children) {
  //         item.children.forEach((child, childIndex, children) => {
  //           dispatch({
  //             type: 'category/coverCategory',
  //             payload: {
  //               objectId: item.children.node.objectId,
  //               path: item.children.path,
  //               pathLevel: item.children.path.length,
  //               pathIndex: item.children.treeIndex,
  //             },
  //           });
  //         });
  //       }
  //     }
  //   });
  // };


  handleSubmit = (e) => {
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
          }).then(() => {
            const { relationSpec } = values;
            this.handleSort();
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

    const specData = this.props.spec.data;
    const specs = this.Tree(specData.results, 'pointerSpec');

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
      relationSpec: [],
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
          relationSpec: [],
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
          relationSpec: [],
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
          relationSpec: selectedNode ? selectedNode.relationSpec : [],
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
                <Form.Item label="分类规格" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} >
                  {getFieldDecorator('relationSpec', {
                    valuePropName: 'value',
                    initialValue: category.relationSpec,
                  })(
                    <TreeSelect
                      treeData={specs}
                      treeCheckable={true}
                      showCheckedStrategy={TreeSelect.SHOW_PARENT}
                      placeholder="请选择分类规格"
                    />
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
