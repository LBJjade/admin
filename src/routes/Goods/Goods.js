import React from 'react';
import { connect } from 'dva';
import { Route, Redirect } from 'dva/router';
import { Row, Col, Card, Input, Icon, InputNumber, Switch, Button, Form, Upload, Modal, TreeSelect, Radio, Checkbox, Tabs, Table, Select } from 'antd';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from '../../components/FooterToolbar';
import styles from './Goods.less';
import globalConfig from '../../config';
import EditableTable from '../../components/EditableTable';
import UploadImage from '../../components/UploadImage';

const { TextArea } = Input;
const RadioGroup = Radio.Group;

@connect(({ goods, category, group, spec }) => ({ goods, category, group, spec }))
@Form.create()
export default class Goods extends React.PureComponent {
  state = {
    goods: undefined,
    pointerCategory: '',
    categorySpec: [],
    adding: false,
    editing: false,
    editorState: EditorState.createEmpty(),
  };

  componentDidMount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'goods/fetchGoods',
    //   payload: {
    //     count: true,
    //   },
    // });

    const { dispatch } = this.props;
    dispatch({
      type: 'category/fetchCategory',
      payload: {
        count: true,
      },
    });

    dispatch({
      type: 'group/fetchGroup',
      payload: {
        count: true,
      },
    });

    dispatch({
      type: 'spec/fetchSpec',
      payload: {
        count: true,
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    const { params } = nextProps.match;
    const { dispatch } = this.props;

    if (nextProps.goods.goods) {
      const goods = nextProps.goods.goods.results;
      if (goods && goods.length) {
        this.setState({ goods: { ...goods[0] } });
      } else {
        this.setState({ goods: undefined });
      }
    }

    if (!this.state.params && params.objectId) {
      this.setState({ params });
      dispatch({
        type: 'goods/fetchGoods',
        payload: {
          where: params,
        },
      });

      dispatch({
        type: 'goods/fetchGoodsImage',
        payload: {
          where: {
            pointerGoods: {
              __type: 'Pointer',
              className: 'Goods',
              objectId: params.objectId,
            },
          },
        },
      });
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

  handleChange = (editorState) => {
    this.setState({ editorState });
  };

  handleCategoryChange = (value) => {
    const category = this.props.category.data.results.find(i => i.objectId === value);
    if (category.categorySpec) {
      this.setState({
        pointerCategory: value,
        categorySpec: category.categorySpec,
      });
      this.handleGoodsSpecChange(category.categorySpec);
    } else {
      if (category.pointerCategory) {
        const categoryParent = this.props.category.data.results.find(i => i.objectId === category.pointerCategory.objectId);
        if (categoryParent && categoryParent.categorySpec) {
          this.setState({
            pointerCategory: value,
            categorySpec: categoryParent.categorySpec,
          });
          this.handleGoodsSpecChange(categoryParent.categorySpec);
        } else {
          this.setState({
            pointerCategory: value,
            categorySpec: [],
          });
          this.handleGoodsSpecChange([]);
        }
      } else {
        this.setState({
          pointerCategory: value,
          categorySpec: [],
        });
        this.handleGoodsSpecChange([]);
      }
    }

    this.props.form.resetFields();
  };

  handleGoodsSpecChange = (value) => {
    const values = value.toString();

    // 过滤选择规格
    const specs = this.props.spec.data.results;
    const specChild = specs.filter(i => values.indexOf(i.objectId) >= 0);

    // 获取父级规格
    const specTmp = [];
    specChild.forEach((i) => {
      if (i.pointerSpec) {
        specTmp.push(i.pointerSpec.objectId);
      } else {
        specTmp.push(i.objectId);
      }
    });
    // 父级规格去重
    const specTmp2 = [...new Set(specTmp)];
    const specTmp3 = specTmp2.toString();

    // 重获父级规格
    const specParent = specs.filter(i => specTmp3.indexOf(i.objectId) >= 0);

    const specColumns = [];
    let specDataSource = [];

    specParent.forEach((i) => {
      specColumns.push({
        title: i.name,
        dataIndex: i.objectId,
        key: i.objectId,
      });
    });

    // 递归计算DataSource
    for (let i = 0; i < specColumns.length; i += 1) {
      const col = specColumns[i];
      const tmp = [];
      if (i <= 0) {
        specChild.filter(j => j.pointerSpec.objectId === col.dataIndex).forEach((k) => {
          const obj = {};
          obj.key = k.objectId;
          obj[col.dataIndex] = k.name;
          specDataSource.push(obj);
        });
      } else {
        specDataSource.forEach((l) => {
          specChild.filter(j => j.pointerSpec.objectId === col.dataIndex).forEach((k) => {
            const obj = { ...l };
            obj.key = `${obj.key}-${k.objectId}`;
            obj[col.dataIndex] = k.name;
            tmp.push(obj);
          });
        });
      }
      if (tmp.length > 0) {
        specDataSource = tmp;
      }
    }

    this.setState({
      specChild,
      specParent,
      specColumns,
      specDataSource,
    });

    this.props.form.resetFields();
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { validateFields } = this.props.form;
    validateFields({ force: true }, (err, values) => {
      if (err === null || !err) {
        const { dispatch } = this.props;

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

  render() {
    const { getFieldDecorator } = this.props.form;
    const { goods, adding, editing } = this.state;

    const categorys = this.Tree(this.props.category.data.results, 'pointerCategory');
    const specs = this.Tree(this.props.spec.data.results, 'pointerSpec');
    const { pointerCategory } = this.state;
    const { categorySpec } = this.state;
    let { specColumns } = this.state;
    let { specDataSource } = this.state;

    const groups = this.Tree(this.props.group.group.results, 'pointerGroup');

    const fileList = [{
      uid: 'file0001',
      name: 'card-1.jpeg',
      status: 'done',
      thumbUrl: `${globalConfig.imageUrl}card-1.jpeg`,
    }, {
      uid: 'file0002',
      name: 'card-2.jpeg',
      status: 'done',
      thumbUrl: `${globalConfig.imageUrl}card-2.jpeg`,
    }, {
      uid: 'file0003',
      name: 'card-3.jpeg',
      status: 'done',
      thumbUrl: `${globalConfig.imageUrl}card-3.jpeg`,
    }];

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const formItemLayoutM = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 10 },
      },
    };

    const { editorState } = this.state;

    const specColumnsExtra = [
      {
        dataIndex: 'price',
        title: '单价',
        key: 'price',
        editable: true,
      }, {
        dataIndex: 'stock',
        title: '库存',
        key: 'stock',
        editable: true,
      }, {
        dataIndex: 'barCode',
        title: '条码',
        key: 'barCode',
        editable: true,
      },
    ];

    if (specColumns) {
      specColumns = specColumns.concat(specColumnsExtra);
    }

    if (specDataSource) {
      specDataSource = specDataSource.map(i => ({ ...i, price: 0, stock: 1, barCode: '' }));
    }

    const keyword = ['我们', '五月的阳光'];
    // for (let i = 10; i < 36; i++) {
    //   keyword.push(<Select.Option key={i.toString(36) + i}>{i.toString(36) + i}</Select.Option>);
    // }
    const keywordOption = keyword.map(i => (<Select.Option key={i}>{i}</Select.Option>));

    return (
      <div>
        <PageHeaderLayout>
          <div className={styles.goods}>
            <Form onSubmit={this.handleSubmit} load>
              <Card>
                <Form.Item>
                  {getFieldDecorator('objectId', {
                    initialValue: goods ? goods.objectId : '',
                  })(
                    <Input hidden />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品主图"
                >
                  <UploadImage
                    listType="picture-card"
                    defaultFileList={[...fileList]}
                    limitFileCount={5}
                  />
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品标题"
                >
                  {getFieldDecorator('title', {
                    initialValue: goods ? goods.title : '',
                    rules: [
                      { required: true, message: '请输入商品标题！' },
                    ],
                  })(
                    <Input placeholder="给商品起一个通俗易懂的标题..." />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品名称"
                >
                  {getFieldDecorator('goodsName', {
                    initialValue: goods ? goods.goodsName : '',
                    rules: [
                      { required: true, message: '请输入商品名称！' },
                    ],
                  })(
                    <Input placeholder="行业标准的商品名称..." />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayoutM}
                  label="商品编号"
                >
                  {getFieldDecorator('goodsSn', {
                    initialValue: goods ? goods.goodsSn : '',
                    rules: [
                      { required: true, message: '请输入商品编号！' },
                    ],
                  })(
                    <Input placeholder="行业标准的商品编号..." />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="单价"
                >
                  {getFieldDecorator('price', {
                    initialValue: goods ? goods.price : 0,
                    rules: [
                      { required: true, message: '请输入商品单价！' },
                    ],
                  })(
                    <InputNumber
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                    />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="是否包邮"
                >
                  {getFieldDecorator('isSendFree', {
                    valuePropName: 'checked',
                    initialValue: goods ? goods.isSendFree : 0,
                    rules: [
                      { required: false, message: '请选择是否包邮配送！' },
                    ],
                  })(
                    <Checkbox>包邮</Checkbox>
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="上架/下架"
                >
                  {getFieldDecorator('status', {
                    valuePropName: 'checked',
                    initialValue: goods ? goods.status : false,
                    rules: [
                      { required: true, message: '请输入商品单价！' },
                    ],
                  })(
                    <Switch checkedChildren="上架" unCheckedChildren="下架" />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="实物/虚拟"
                >
                  {getFieldDecorator('isVirtual', {
                    initialValue: goods ? goods.isVirtual : 0,
                    rules: [
                      { required: false, message: '请选择是否虚拟商品！' },
                    ],
                  })(
                    <RadioGroup onChange={this.onChange}>
                      <Radio value={0}>实物商品</Radio>
                      <Radio value={1}>虚拟商品（服务产品）</Radio>
                    </RadioGroup>
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="减库存方式"
                >
                  {getFieldDecorator('totalCnf', {
                    initialValue: goods ? goods.totalCnf : 1,
                    rules: [
                      { required: false, message: '请选择减库存方式！' },
                    ],
                  })(
                    <RadioGroup>
                      <Radio value={1}>拍下减库存</Radio>
                      <Radio value={0}>永不减库存</Radio>
                    </RadioGroup>
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="零库存"
                >
                  {getFieldDecorator('zeroStockCnf', {
                    initialValue: goods ? goods.zeroCnf : 1,
                    rules: [
                      { required: false, message: '选择零库存影响上下架方式！' },
                    ],
                  })(
                    <RadioGroup onChange={this.onChange}>
                      <Radio value={1}>零库存自动下架</Radio>
                      <Radio value={0}>零库存不改变上下架状态</Radio>
                    </RadioGroup>
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品分类"
                >
                  {getFieldDecorator('pointerCategory', {
                    initialValue: pointerCategory,
                    rules: [
                      { required: true, message: '请输入商品分类！' },
                    ],
                  })(
                    <TreeSelect
                      treeData={categorys}
                      placeholder="请选择商品分类"
                      onChange={value => this.handleCategoryChange(value)}
                    />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品规格"
                >
                  {getFieldDecorator('GoodsSpec', {
                    valuePropName: 'value',
                    initialValue: categorySpec,
                  })(
                    <TreeSelect
                      treeData={specs}
                      treeCheckable
                      showCheckedStrategy={TreeSelect.SHOW_CHILD}
                      placeholder="请选择商品规格"
                      onChange={value => this.handleGoodsSpecChange(value)}
                    />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="规格单价库存"
                >
                  <EditableTable
                    size="small"
                    columns={specColumns}
                    dataSource={specDataSource}
                    pagination={false}
                  />
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品分组"
                >
                  {getFieldDecorator('relationGroup', {
                    valuePropName: 'value',
                    initialValue: goods && goods.relationGroup ? goods.relationGroup : [],
                  })(
                    <TreeSelect
                      treeData={groups}
                      treeCheckable
                      showCheckedStrategy={TreeSelect.SHOW_ALL}
                      placeholder="请选择商品分组"
                    />
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品推广"
                >
                  {getFieldDecorator('isRecommand', {
                    valuePropName: 'checked',
                    initialValue: goods ? goods.isRecommand : 0,
                    rules: [
                      { required: false, message: '请选择商品属性！' },
                    ],
                  })(
                    <Checkbox>推荐首页</Checkbox>
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="关键字"
                >
                  {getFieldDecorator('keyword', {
                    initialValue: goods ? goods.keyword : keyword,
                    rules: [
                      { required: false, message: '请输入商品关键字！' },
                    ],
                  })(
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      tokenSeparators={[',']}
                      tags
                      placeholder="输入该商品的一些关键字，便于快速查找到该商品信息；回车键输入多个。"
                    >
                      {keywordOption}
                    </Select>
                  )}
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="商品描述"
                >
                  <TextArea
                    rows={3}
                    placeholder="请输入商品描述；该商品描述在一些商品显示页中作为副标题显示。"
                  />
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="详细描述"
                >
                  <Editor
                    // https://jpuri.github.io/react-draft-wysiwyg/#/docs
                    localization={{ locale: 'zh' }}
                    editorState={editorState}
                    // toolbarClassName="toolbarClassName"
                    // wrapperClassName="wrapperClassName"
                    // editorClassName="editorClassName"
                    // wrapperClassName="wysiwyg-wrapper"
                    toolbar={{
                      options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'image', 'remove', 'history'],
                    }}
                    onEditorStateChange={this.handleChange}
                    editorStyle={{ height: 360, border: 1, borderStyle: 'solid', borderColor: '#ccc' }}
                  />
                </Form.Item>
              </Card>
            </Form>
          </div>
        </PageHeaderLayout>
        <FooterToolbar>
          <Button type="default" htmlType="button" onClick={e => this.handleCancelEdit(e)} >取消</Button>
          <Button type="primary" htmlType="submit" >保存</Button>
        </FooterToolbar>
      </div>
    );
  }
}
