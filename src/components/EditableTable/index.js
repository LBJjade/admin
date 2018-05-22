import React from 'react';
import { Table, Input, message, Divider, Popconfirm } from 'antd';
import styles from './index.less';

/* column format
columns = [{
  title: i.name,
  dataIndex: i.objectId,
  key: i.objectId,
  editable: true,
}];
*/

class EditableTable extends React.PureComponent {
  state={
    loading: this.props.loading,
    dataKey: this.props.dataKey,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== undefined) {
      this.setState({
        data: nextProps.dataSource,
      });
    }
  }

  getRowByKey = (key, newData) => {
    return (newData || this.state.data).filter(item => item.key === key)[0];
  };

  index = 0;
  cacheOriginData = {};

  toggleEditable = (e, key) => {
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        target.isNew = false;
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: newData });
    }
  };

  remove = (recorde) => {
    const newData = this.state.data.filter(item => item.key !== recorde.key);
    this.setState({ data: newData });
    if (this.props.onRemoveRow) {
      this.props.onRemoveRow(newData, recorde);
    }
    if (this.props.onChange) {
      this.props.onChange(newData);
    }
  };

  handleKeyPress = (e, recode) => {
    if (e.key === 'Enter') {
      this.saveRow(e, recode);
    }
  };

  handleFieldChange = (e, fieldName, key) => {
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (target) {
      target[fieldName] = e.target === undefined ? e : e.target.value;
      this.setState({ data: newData });
    }
  };

  saveRow = (e, recode) => {
    e.persist();
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(recode.key) || {};
      // if (!target[this.state.dataKey] || !target.fieldKey || !target.logic || !target.value) {
      //   message.error('请填写完整条件规则信息。');
      //   e.target.focus();
      //   this.setState({
      //     loading: false,
      //   });
      //   return;
      // }

      // delete target.isNew;
      this.toggleEditable(e, recode.key);
      if (this.props.onChange) {
        this.props.onChange(this.state.data);
      }
      if (this.props.onSaveRow) {
        this.props.onSaveRow(target, recode);
      }
      target.isNew = false;
      this.setState({
        loading: false,
      });
    }, 500);
  };

  cancel = (e, key) => {
    this.clickedCancel = true;
    e.preventDefault();
    const newData = this.state.data.map(item => ({ ...item }));
    const target = this.getRowByKey(key, newData);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: newData });
    this.clickedCancel = false;
  };

  render() {
    let { columns } = this.props;
    // const { dataSource } = this.props;
    const { size } = this.props;
    const { pagination } = this.props;
    const { loading } = this.props;

    if (columns) {
      columns.map((col) => {
        col.render = (text, record) => {
          if (record.editable && col.editable) {
            return (
              <Input
                style={{ width: 50 }}
                value={text}
                onChange={e => this.handleFieldChange(e, col.dataIndex, record.key)}
                onKeyPress={e => this.handleKeyPress(e, record)}
              />
            );
          }
          return text;
        };

        return col;
      });
    }

    const columnAction = [
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          if (!!record.editable && this.state.loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.key)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];

    if (columns && columns.length) {
      columns = columns.concat(columnAction);
    }

    return (
      <div>
        <Table
          loading={loading}
          size={size}
          columns={columns}
          dataSource={this.state.data}
          pagination={pagination}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}

export default EditableTable;
