/* eslint-disable max-len */
import React from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Input, Icon, message, Button, TreeSelect, Divider, Dropdown, Menu, Modal, Affix } from 'antd';
import SortableTree, { getFlatDataFromTree } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Spec.less';

@connect(({ spec, loading }) => ({
  spec,
  loading: loading.models.spec,
}))
@Form.create()
export default class Spec extends React.PureComponent {
  state = {
    treeData: [],
    selectedNode: undefined,
    selectedPath: [],
    editing: false,
    // '': 非新建；'child': 新建子级；'brother': 新建兄弟
    adding: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'spec/fetchSpec',
      payload: {
        count: true,
        order: 'pathIndex',
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.spec.data) {
      this.setState({ treeData: this.Tree(nextProps.spec.data.results) });
    }
  }

  Tree = (data) => {
    const val = [];
    if (data) {
      // 删除 所有 children,以防止多次调用；加入key、value、label
      data.forEach((item) => {
        item.title = item.name;
        item.subtitle = (item.description ? (<span className={styles.subtitle}>{item.description}</span>) : '');
        item.label = item.name;
        item.id = item.pathIndex || `-${item.objectId}`;
        item.key = item.pathIndex || `-${item.objectId}`;
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
        const parent = map[item.pointerSpec ? item.pointerSpec.objectId : undefined];
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
      });
    }
  };

  handleRemoveNode = (e, rowInfo) => {
    // Todo
    const deleteNode = rowInfo.node;
    if (deleteNode.children) {
      message.warn('此规格存在子规格，禁止删除！', 5);
    } else {
      const { dispatch } = this.props;
      dispatch({
        type: 'spec/removeSpec',
        payload: {
          objectId: deleteNode.objectId,
        },
      });
    }
  };

  // Called after node move operation.
  // ({ treeData: object[], node: object, nextParentNode: object, prevPath: number[] or string[], prevTreeIndex: number, nextPath: number[] or string[], nextTreeIndex: number }): void
  handleMoveNode = (data) => {
    const { node, nextParentNode } = data;
    const { dispatch } = this.props;
    if (node.pointerSpec && nextParentNode && node.pointerSpec.objectId !== nextParentNode.objectId) {
      // 父节点不同，更新父节点
      dispatch({
        type: 'spec/coverSpec',
        payload: {
          objectId: node.objectId,
          pointerSpec: {
            __type: 'Pointer',
            className: 'Spec',
            objectId: nextParentNode ? nextParentNode.objectId : '',
          },
        },
      });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (err === null || !err) {
        // 置换pointerSpec对象
        const pointerSpec = {
          __type: 'Pointer',
          className: 'Spec',
          objectId: values.pointerSpec,
        };

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
            type: 'spec/coverSpec',
            payload: {
              ...values, pointerSpec, pathLevel,
            },
          }).then(() => {
            this.handleSort();
          });
        } else {
          // 新建节点
          pathLevel = this.state.selectedPath.length;

          this.props.dispatch({
            type: 'spec/storeSpec',
            payload: {
              ...values, pointerSpec, pathLevel,
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
          title: '确认删除该规格吗？',
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
    getFlatDataFromTree({
      treeData: this.state.treeData,
      getKey: node => node.objectId,
      getParentKey: node => node.pointerSpec.objectId,
      getNodeKey: ({ treeIndex }) => treeIndex,
    }).forEach((item) => {
      if (force || item.node.pathIndex === undefined || item.treeIndex !== item.node.pathIndex || item.node.path === undefined || item.path.toString() !== item.node.path.toString()) {
        this.props.dispatch({
          type: 'spec/coverSpec',
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const { data } = this.props.spec;
    const specs = this.Tree(data.results);
    const specsSelect = [{
      label: '规格模版',
      key: 'top',
      value: '',
      children: specs,
    }];
    const { editing, adding, selectedNode } = this.state;

    let title = '编辑规格';
    let spec = {
      objectId: '',
      name: '',
      pointerSpec: '',
    };

    switch (adding) {
      case 'child':
        spec = {
          objectId: '',
          name: '',
          pointerSpec: selectedNode ? selectedNode.objectId || '' : '',
        };
        title = '新建规格';
        break;
      case 'brother':
        spec = {
          objectId: '',
          name: '',
          pointerSpec: selectedNode && selectedNode.pointerSpec ? selectedNode.pointerSpec.objectId || '' : '',
        };
        title = '新建规格';
        break;
      default:
        spec = {
          objectId: selectedNode ? selectedNode.objectId : '',
          name: selectedNode ? selectedNode.name : '',
          pointerSpec: selectedNode && selectedNode.pointerSpec ? selectedNode.pointerSpec.objectId || '' : '',
        };
        break;
    }

    const newButton = (
      <div>
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={e => this.handleAddBrotherNode(e, null)}
          icon="plus"
        >
          新建规格
        </Button>
      </div>
    );

    return (
      <PageHeaderLayout
        title="规格模版管理"
      >
        <Row gutter={24}>
          <Col xl={12} lg={24} md={24} sm={24} xs={24}>
            <Row>
              <Card>
                { specs.length <= 0 ? newButton : '' }
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
                    initialValue: spec.objectId,
                  })(
                    <Input hidden />
                  )}
                </Form.Item>
                <Form.Item label="父级规格" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} >
                  {getFieldDecorator('pointerSpec', {
                    initialValue: spec.pointerSpec,
                  })(
                    <TreeSelect treeData={specsSelect} placeholder="请选择父级规格" disabled />
                  )}
                </Form.Item>
                <Divider dashed />
                <Form.Item label="规格名称" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                  {getFieldDecorator('name', {
                    initialValue: spec.name,
                  })(
                    <Input placeholder="请输入规格名称" />
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
