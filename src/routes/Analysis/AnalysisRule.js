/* eslint-disable max-len */
import React, { Component } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider, Select } from 'antd';
import styles from './style.less';
import { randomString } from '../../utils/cryptoUtils';

const { Option } = Select;

export default class AnalysisRule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: props.loading,
      // dataSource: props.dataSource,
      dataAnalysisField: props.dataAnalysisField,
      dataKey: props.dataKey,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.pointerIntention !== nextProps.pointerIntention) {
      if (nextProps.dataSource !== undefined) {
        this.setState({
          data: nextProps.dataSource,
        });
      }
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
    this.props.onRemoveRow(newData, recorde);
    this.props.onChange(newData);
  };

  newRow = () => {
    const newData = this.state.data.map(item => ({ ...item }));
    newData.push({
      objectId: `NEW_TEMP_ID_${this.index}`,
      key: randomString(10),
      isRequired: (this.state.dataKey === 'isRequired' ? 1 : 0),
      isOptional: (this.state.dataKey === 'isOptional' ? 1 : 0),
      fieldKey: '',
      logic: '',
      value: '',
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({ data: newData });
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
      if (!target[this.state.dataKey] || !target.fieldKey || !target.logic || !target.value) {
        message.error('请填写完整条件规则信息。');
        e.target.focus();
        this.setState({
          loading: false,
        });
        return;
      }

      // delete target.isNew;
      this.toggleEditable(e, recode.key);
      this.props.onChange(this.state.data);
      this.props.onSaveRow(target, recode);
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
    const columns = [{
      title: '条件类型',
      dataIndex: this.state.dataKey,
      key: this.state.dataKey,
      width: '20%',
      render: (text, record) => {
        // let ruleType = [];
        //
        // if (this.state.dataKey === 'isRequired') {
        //   ruleType = [{ objectId: 'XDE9jnTaq8', key: 1, label: '必要条件' }];
        // }
        // if (this.state.dataKey === 'isOptional') {
        //   ruleType = [{ objectId: 'PWuNiLqB', key: 2, label: '充分条件' }];
        // }

        if (record.editable) {
          return (
            <Select
              defaultValue={text}
              onChange={e => this.handleFieldChange(e, this.state.dataKey, record.key)}
              onKeyPress={e => this.handleKeyPress(e, record)}
            >
              {
                // ruleType.map(owner =>
                //   <Option key={owner.objectId} value={owner.key}>{owner.label}</Option>
                // )
                <Option key={1} value={1}>{this.state.dataKey === 'isRequired' ? '必要条件' : '充分条件'}</Option>
              }
            </Select>
          );
        }
        // return ruleType.find((item) => { return item.key === text; }).label;
        return this.state.dataKey === 'isRequired' ? '必要条件' : '充分条件';
      },
    }, {
      title: '条件名称',
      dataIndex: 'fieldKey',
      key: 'fieldKey',
      width: '20%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Select
              defaultValue={text}
              onChange={e => this.handleFieldChange(e, 'fieldKey', record.key)}
              onKeyPress={e => this.handleKeyPress(e, record)}
            >
              {
                this.state.dataAnalysisField.results.map(owner =>
                  <Option key={owner.objectId} value={owner.fieldKey}>{owner.fieldName}</Option>
                )
              }
            </Select>
          );
        }
        return this.state.dataAnalysisField.results.find((item) => { return item.fieldKey === text; }).fieldName;
      },
    }, {
      title: '判断逻辑',
      dataIndex: 'logic',
      key: 'logic',
      width: '20%',
      render: (text, record) => {
        const logic = [
          { objectId: 0, key: '$lt', label: '小于' },
          { objectId: 1, key: '$lte', label: '小于或等于' },
          { objectId: 2, key: '$gt', label: '大于' },
          { objectId: 3, key: '$gte', label: '大于或等于' },
          { objectId: 4, key: '$ne', label: '不等于' },
          { objectId: 5, key: '$et', label: '等于' },
          { objectId: 6, key: '$in', label: '在内(逗号分隔)' },
          { objectId: 7, key: '$lk', label: '模糊包含' },
        ];

        if (record.editable) {
          return (
            <Select
              defaultValue={text}
              onChange={e => this.handleFieldChange(e, 'logic', record.key)}
              onKeyPress={e => this.handleKeyPress(e, record)}
            >
              {
                logic.map(owner =>
                  <Option key={owner.objectId} value={owner.key}>{owner.label}</Option>
                )
              }
            </Select>
          );
        }
        return logic.find((item) => { return item.key === text; }).label;
      },
    }, {
      title: '阀值',
      dataIndex: 'value',
      key: 'value',
      width: '20%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={e => this.handleFieldChange(e, 'value', record.key)}
              onKeyPress={e => this.handleKeyPress(e, record)}
              placeholder="阀值"
            />
          );
        }
        return text;
      },
    }, {
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
    }];

    const disableNew = (this.props.pointerIntention.length <= 0);

    const { loading } = this.props;

    // const { dataSource } = this.props;

    return (
      <div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
        />
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newRow}
          icon="plus"
          disabled={disableNew}
        >
          新增条件
        </Button>
      </div>
    );
  }
}
