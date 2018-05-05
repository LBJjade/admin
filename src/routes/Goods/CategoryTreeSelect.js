import React from 'react';
import { TreeSelect } from 'antd';

export default class CategoryTreeSelect extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dataTree: [],
      value: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataTree: nextProps.dataTree,
      value: nextProps.value,
    });
  }

  handleSelect = (selectedKeys, e) => {
    console.log(e);
    // if (this.props.onSelect) {
    //   this.props.onSelect(selectedKeys, e);
    // }
  };

  render() {
    const { dataTree, value } = this.state;
    return (
      <TreeSelect treeData={dataTree} value={value} />
    );
  }
}

