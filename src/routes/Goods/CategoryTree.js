import React from 'react';
import { Popover, Icon } from 'antd';
import SortableTree, { changeNodeAtPath, removeNodeAtPath } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';

export default class CategoryTree extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedNodeId: '',
      treeData: [],
      selectedNode: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      treeData: nextProps.treeData,
    });
  }

  handleChange = (treeData) => {
    this.setState({ treeData });
  };

  handleClickNode = (event, rowInfo) => {
    if (this.props.onClickNode) {
      this.props.onClickNode(event, rowInfo);
    }
  };
  handleEditNode = (event, rowInfo) => {
    if (this.props.onEditNode) {
      this.props.onEditNode(event, rowInfo);
    }
  };
  handleAddNode = (event, rowInfo) => {
    if (this.props.onAddNode) {
      this.props.onAddNode(event, rowInfo);
    }
  };
  handleRemoveNode = (event, rowInfo) => {
    if (this.props.onRemoveNode) {
      this.props.onRemoveNode(event, rowInfo);
    }
  };

  render() {
    const content = (
      <div>
        <p>Content</p>
        <p>Content</p>
      </div>
    );
    return (
      <div style={{ height: 500 }}>
        <SortableTree
          treeData={this.state.treeData}
          onChange={treeData => this.setState({ treeData })}
          generateNodeProps={(rowInfo) => {
            const propsNode = {
              onClick: event => this.handleClickNode(event, rowInfo),
              buttons: [
                <Popover placement="rightTop" content={content} title="Title" trigger="click">
                  <Icon type="edit" style={{ margin: 8, cursor: 'pointer' }} onClick={event => this.handleEditNode(event, rowInfo)} />
                </Popover>,
                <Icon type="plus-square-o" style={{ margin: 8, cursor: 'pointer' }} onClick={event => this.handleAddNode(event, rowInfo)} />,
                <Icon type="delete" style={{ margin: 8, cursor: 'pointer' }} onClick={event => this.handleRemoveNode(event, rowInfo)} />,
              ],
            };
            if (this.state.selectedNodeId === rowInfo.node.id) {
              propsNode.className = 'selected-node';
            }
            return propsNode;
          }}
        />
      </div>
    );
  }
}

