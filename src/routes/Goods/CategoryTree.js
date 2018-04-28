import React from 'react';
import { Card, Tree } from 'antd';

export default class CategoryTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // loading: props.loading,
    };
  }

  handleSelect = (selectedKeys, e) => {
    console.log('CategoryTree onSelect event.');
    if (this.props.onSelect) {
      this.props.onSelect(selectedKeys, e);
    }
  };

  render() {
    return (
      <Card>
        <Tree title="全部" key="0000" onSelect={(selectedKeys, e) => this.handleSelect(selectedKeys, e)}>
          <Tree.TreeNode title="女款" key="0001">
            <Tree.TreeNode title="戒指" key="0003" />
            <Tree.TreeNode title="吊坠" key="0004" />
          </Tree.TreeNode>
          <Tree.TreeNode title="男款" key="0002">
            <Tree.TreeNode title="戒指" key="0005" />
          </Tree.TreeNode>
        </Tree>
      </Card>
    );
  }
}

