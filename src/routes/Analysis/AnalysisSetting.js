/* eslint-disable react/jsx-indent,no-trailing-spaces,max-len,react/jsx-wrap-multilines,prefer-destructuring,object-shorthand,padded-blocks,react/jsx-curly-spacing,react/jsx-boolean-value */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Table, Tabs, Icon, Select, Row, message, InputNumber } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import AnalysisRule from './AnalysisRule';

const { TabPane } = Tabs;
const { Option } = Select;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.effects['analysis/fetch'],
}))
@Form.create()
export default class AnalysisSetting extends Component {
  state = {
    selectedIntention: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'analysis/fetchIntention',
      payload: {},
    });
    dispatch({
      type: 'analysis/fetchAnalysisField',
      payload: {},
    });
  }

  handleSaveRow(e, dataKey) {
    const { dispatch } = this.props;

    if (e.isNew) {
      dispatch({
        type: 'analysis/storeAnalysisRule',
        payload: {
          fieldKey: e.fieldKey,
          logic: e.logic,
          value: e.value,
          isRequired: e.isRequired,
          isOptional: e.isOptional,
          pointerIntention: {
            __type: 'Pointer',
            className: 'Intention',
            objectId: this.state.selectedIntention,
          },
          key: e.key,
        },
      }).then(() => {
        e.isNew = false;
      }).catch(() => {
        message.error('保存失败！', 5);
      });
    } else {

      // 通过key查找ObjectId
      const { analysisRule } = this.props.analysis;
      const target = analysisRule.results.filter(item => item.key === e.key);

      if (target.length > 0) {
        const objectId = target[0].objectId;

        dispatch({
          type: 'analysis/coverAnalysisRule',
          payload: {
            objectId: objectId,
            fieldKey: e.fieldKey,
            logic: e.logic,
            value: e.value,
            isRequired: (dataKey === 'isRequired' ? 1 : 0),
            isOptional: (dataKey === 'isOptional' ? 1 : 0),
            key: e.key,
          },
        }).then(() => {
          e.isNew = false;
        }).catch(() => {
          message.error('保存失败！', 5);
        });
      }
    }
  }

  handleRemoveRow(e, record) {
    // 通过key查找ObjectId
    const { analysisRule } = this.props.analysis;
    const target = analysisRule.results.filter(item => item.key === record.key);

    if (target.length > 0) {
      const objectId = target[0].objectId;

      this.props.dispatch({
        type: 'analysis/removeAnalysisRule',
        payload: {
          objectId: objectId,
        },
      }).then().catch(() => {
        message.error('删除数据失败！', 5);
      });
    }
  }

  handleIntentionChange(e) {
    if (e !== undefined) {
      this.props.dispatch({
        type: 'analysis/fetchAnalysisRule',
        payload: {
          where: {
            pointerIntention: {
              __type: 'Pointer',
              className: 'Intention',
              objectId: e,
            },
          },
        },
      }).then(() => {
        this.setState({
          selectedIntention: e,
        });
      }).catch(() => {
        message.error('获取数据失败！', 5);
      });
    }
  }

  render() {
    // const { submitting } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { intention, analysisField, analysisRule, loading } = this.props.analysis;

    const analysisRuleRequired = analysisRule.results.filter(item => item.isRequired === 1);
    const analysisRuleOptional = analysisRule.results.filter(item => item.isOptional === 1);

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 6 },
    };

    return (
      <PageHeaderLayout
        title="分析规则管理"
        logo={<img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png" />}
        content="客户意向级别根据设定的分析规则进行判断；而分析规则可以由多个逻辑条件构成。"
      >
        <Card>
          <Tabs defaultActiveKey="1">
            <TabPane tab={<span><Icon type="info-circle-o" />规则详情</span>} key="1">
              <Table
                loading={loading}
                dataSource={intention.results}
                columns={[{
                  title: '序号',
                  dataIndex: 'intentionLevel',
                  key: 'intentionLevel',
                }, {
                  title: '意向级别',
                  dataIndex: 'intentionName',
                  key: 'intentionName',
                }, {
                  title: '必要条件',
                  dataIndex: 'countRequired',
                  key: 'countRequired',
                }, {
                  title: '充分条件',
                  dataIndex: 'countOptional',
                  key: 'countOptional',
                }, {
                  title: '备注',
                  dataIndex: 'remark',
                  key: 'remark',
                }]}
                pagination={false}
                rowKey="objectId"
              />
            </TabPane>
            <TabPane tab={<span><Icon type="setting" />规则设置</span>} key="2">
              <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }} hideRequiredMark>
                <Row>
                  <Form.Item label="意向级别" { ...formItemLayout }>
                    {getFieldDecorator('intention', {
                      rules: [{ required: true, message: '请选择意向级别!' }],
                    })(
                      <Select initialValue="1" onChange={e => this.handleIntentionChange(e)}>
                        { intention.results.map(owner =>
                          <Option key={owner.intentionLevel} value={owner.objectId} disabled={owner.disabled}>
                            { owner.intentionName }
                          </Option>)
                        }
                      </Select>
                    )}
                  </Form.Item>
                </Row>
                <Row>
                  <Form.Item label="必要条件" { ...formItemLayout }>
                    <InputNumber
                      value={analysisRuleRequired.length}
                      min={analysisRuleRequired.length}
                      max={analysisRuleRequired.length}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item label="充分条件" { ...formItemLayout }>
                    <InputNumber
                      defaultValue={0}
                      min={0}
                      max={analysisRuleOptional.length}
                    />
                  </Form.Item>
                </Row>
                <Tabs defaultActiveKey="required">
                  <TabPane tab={<span><Icon type="check" />必要条件</span>} key="required" forceRender={true}>
                    <Form.Item>
                      {getFieldDecorator('requirerule')(
                        <AnalysisRule
                          loading={loading}
                          dataKey="isRequired"
                          dataSource={analysisRuleRequired}
                          pointerIntention={this.state.selectedIntention}
                          dataAnalysisField={analysisField}
                          onSaveRow={e => this.handleSaveRow(e, 'isRequired')}
                          onRemoveRow={(e, recode) => this.handleRemoveRow(e, recode)}
                        />
                      )}
                    </Form.Item>
                  </TabPane>
                  <TabPane tab={<span><Icon type="ellipsis" />充分条件</span>} key="optional" forceRender={true}>
                    <Form.Item>
                      {getFieldDecorator('optional')(
                        <AnalysisRule
                          loading={loading}
                          dataKey="isOptional"
                          dataSource={analysisRuleOptional}
                          pointerIntention={this.state.selectedIntention}
                          dataAnalysisField={analysisField}
                          onSaveRow={e => this.handleSaveRow(e, 'isOptional')}
                          onRemoveRow={(e, recode) => this.handleRemoveRow(e, recode)}
                        />
                      )}
                    </Form.Item>
                  </TabPane>
                </Tabs>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </PageHeaderLayout>
    );
  }
}
