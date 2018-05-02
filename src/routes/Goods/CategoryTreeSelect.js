import React from 'react';
import { TreeSelect } from 'antd';

export default class CategoryTreeSelect extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dataCategory: [],
      value: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataCategory: nextProps.dataCategory,
      value: nextProps.value,
    });
  }

  handleSelect = (selectedKeys, e) => {
    console.log(e);
    // if (this.props.onSelect) {
    //   this.props.onSelect(selectedKeys, e);
    // }
  };

  Tree = (data) => {
    const val = [];
    if (data) {
      // 删除 所有 children,以防止多次调用；加入key、value、label
      data.forEach((item) => {
        item.key = item.objectId;
        item.value = item.objectId;
        item.label = item.name;
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

  render() {
    const { dataCategory, value } = this.state;
    const dataTree = this.Tree(dataCategory);
    return (
      <TreeSelect treeData={dataTree} value={value} />
    );
  }
}

