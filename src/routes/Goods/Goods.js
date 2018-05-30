/* eslint-disable prefer-destructuring */
import React from 'react';
import { connect } from 'dva';
import _ from 'lodash';
import { Link } from 'dva/router';
import { Card, Input, InputNumber, Switch, Button, Form, TreeSelect, Radio, Checkbox, Select, Spin } from 'antd';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import FooterToolbar from '../../components/FooterToolbar';
import styles from './Goods.less';
import globalConfig from '../../config';
import Exception from '../../components/Exception';
import EditableTable from '../../components/EditableTable';
import UploadImage from '../../components/UploadImage';

const { TextArea } = Input;
const RadioGroup = Radio.Group;

@connect(({ goods, loading, category, group, spec, file }) => ({
  goods,
  loading: loading.models.goods,
  category,
  group,
  spec,
  file,
}))
@Form.create()
export default class Goods extends React.PureComponent {
  state = {
    editing: false,
    editorState: EditorState.createEmpty(),
    price: 0,
    weight: 0,
    stock: 0,
  };

  componentWillMount() {
    const { dispatch, location } = this.props;
    const { search } = location;

    if (search) {
      const objectId = search.replace('?', '');
      dispatch({
        type: 'goods/fetchGoods',
        payload: {
          objectId,
        },
      }).then(() => {
        const { goods } = this.props.goods;
        if (goods && goods.objectId) {
          dispatch({
            type: 'file/fetchFile',
            payload: {
              where: {
                pointerClassName: 'Goods',
                pointerObjectId: goods.objectId,
              },
            },
          });
        } else {
          dispatch({
            type: 'file/trashFile',
          });
        }
      });
      dispatch({
        type: 'goods/fetchGoodsSku',
        payload: {
          where: {
            pointerGoods: {
              __type: 'Pointer',
              className: 'Goods',
              objectId,
            },
          },
          order: 'order',
        },
      });
    } else {
      dispatch({
        type: 'goods/trashGoods',
      });
    }

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
    if (nextProps.goods.goods !== this.props.goods.goods) {
      const { goods } = nextProps.goods;
      this.setState({ price: goods && goods.price ? goods.price : 0 });
      this.setState({ weight: goods && goods.weight ? goods.weight : 0 });
      this.setState({ stock: goods && goods.stock ? goods.stock : 0 });
    }

    if (nextProps.goods.goodsSku !== this.props.goods.goodsSku) {
      // this.setState({ goodsSku: nextProps.goods.goodsSku });

      // 组织goodsSku数据结构
      const goodsSkuColumns = [];
      if (nextProps.goods.goodsSku.results.length > 0) {
        const goodsSkuItem = nextProps.goods.goodsSku.results[0];
        const skuName = goodsSkuItem.skuName.split(',');
        skuName.forEach((item, index) => {
          const col = {
            title: item.split(':')[0],
            dataIndex: `spec_${index}`,
            key: `spec_${index}`,
          };
          goodsSkuColumns.push(col);
        });
        goodsSkuColumns.push({ title: '单价', dataIndex: 'price', key: 'price', editable: true, type: 'number', min: 0 });
        goodsSkuColumns.push({ title: '重量', dataIndex: 'weight', key: 'weight', editable: true, type: 'number', min: 0 });
        goodsSkuColumns.push({ title: '库存', dataIndex: 'stock', key: 'stock', editable: true, type: 'number', min: 0 });
        goodsSkuColumns.push({ title: '条码', dataIndex: 'barCode', key: 'barCode', editable: true });

        this.setState({ specColumns: goodsSkuColumns });
        this.setState({ specDataSource: nextProps.goods.goodsSku.results });
      }
    }

    const { search } = this.props.location;
    if (search) {
      this.setState({ editing: true });
    }
  }

  componentWillUnmount() {
    // 清除model
    const { dispatch } = this.props;
    dispatch({
      type: 'goods/trashFile',
    });
    dispatch({
      type: 'goods/trashGoodsSku',
    });
    dispatch({
      type: 'file/trashFile',
    });
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
    // 重选value = undefined
    if (value === undefined) {
      return;
    }
    // 重新初始化
    this.props.form.resetFields(['goodsSpec', 'goodsSpec', 'goodsSku']);

    // 选取类目规格规格：优先本类目规格，再父级类目规格
    const category = this.props.category.category.results.find(i => i.objectId === value);

    if (category.categorySpec && category.categorySpec.length) {
      this.handleGoodsSpecChange(category.categorySpec);
      return;
    }

    if (category && category.pointerCategory) {
      const categoryParent = this.props.category.category.results.find(i => i.objectId === category.pointerCategory.objectId);
      if (categoryParent && categoryParent.categorySpec) {
        this.handleGoodsSpecChange(categoryParent.categorySpec);
      }
    }
  };

  handleGoodsSpecChange = (value) => {
    const values = value.toString();

    // 过滤选择规格
    const specs = this.props.spec.spec.results;
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

    let specColumns = [];
    let specDataSource = [];

    specParent.forEach((i, index) => {
      specColumns.push({
        title: i.name,
        dataIndex: `spec_${index}_${i.objectId}`,
        key: i.objectId,
      });
    });

    // 递归计算DataSource
    for (let i = 0; i < specColumns.length; i += 1) {
      const col = specColumns[i];
      const tmp = [];
      if (i <= 0) {
        // specChild.filter(j => j.pointerSpec.objectId === col.dataIndex).forEach((k) => {
        specChild.filter(j => col.dataIndex.indexOf(j.pointerSpec.objectId) >= 0).forEach((k) => {
          const obj = {};
          obj.key = `${col.key}:${k.objectId}`;
          obj.skuName = `${col.title}:${k.title}`;
          obj[`spec_${i}`] = k.title;
          specDataSource.push(obj);
        });
      } else {
        specDataSource.forEach((l) => {
          // specChild.filter(j => j.pointerSpec.objectId === col.dataIndex).forEach((k) => {
          specChild.filter(j => col.dataIndex.indexOf(j.pointerSpec.objectId) >= 0).forEach((k) => {
            const obj = { ...l };
            obj.key = `${obj.key},${col.key}:${k.objectId}`;
            obj.skuName = `${obj.skuName},${col.title}:${k.title}`;
            obj[`spec_${i}`] = k.title;
            tmp.push(obj);
          });
        });
      }

      // 列名去掉后面，由原来col_x_xxxxxxxx改为col_x
      col.dataIndex = `spec_${i}`;

      if (tmp.length > 0) {
        specDataSource = tmp;
      }
    }

    // 添加单价库存条码等列
    const specColumnsExtra = [
      {
        dataIndex: 'price',
        title: '单价',
        key: 'price',
        editable: true,
        type: 'number',
        min: 0,
      }, {
        dataIndex: 'weight',
        title: '重量',
        key: 'weight',
        editable: true,
        type: 'number',
        min: 0,
      }, {
        dataIndex: 'stock',
        title: '库存',
        key: 'stock',
        editable: true,
        type: 'number',
        min: 0,
      }, {
        dataIndex: 'barCode',
        title: '条码',
        key: 'barCode',
        editable: true,
      },
    ];

    if (specColumns && specColumns.length) {
      specColumns = specColumns.concat(specColumnsExtra);
    }

    const { price, weight, stock } = this.state;
    if (specDataSource && specDataSource.length) {
      specDataSource = specDataSource.map(i => ({ ...i, price, weight, stock, barCode: '' }));
    }

    this.props.form.resetFields(['goodsSku']);
    this.setState({
      specColumns,
      specDataSource,
    });
  };

  handleImageSuccess = (fileInfo) => {
    const { dispatch, goods } = this.props;
    const file = {
      uid: fileInfo.file.uid,
      name: fileInfo.file.name,
      size: fileInfo.file.size,
      type: fileInfo.file.type,
      lastModifiedDate: fileInfo.file.lastModifiedDate,
      thumbUrl: fileInfo.response.name,
      url: fileInfo.response.url,
      pointerClassName: 'Goods',
      pointerObjectId: goods && goods.goods ? goods.goods.objectId || '' : '',
      status: 'prestore',
    };
    dispatch({
      type: 'file/storeFile',
      payload: file,
    });
  };

  handlePriceChange = (e) => {
    this.setState({ price: e.length <= 0 ? 0 : e });
  };

  handleWeightChange = (e) => {
    this.setState({ weight: e.length <= 0 ? 0 : e });
  };

  handleStockChange = (e) => {
    this.setState({ stock: e.length <= 0 ? 0 : e });
  };

  handleOK = (e) => {
    e.preventDefault();
    const { validateFields } = this.props.form;
    validateFields({ force: true }, (err, values) => {
      if (err === null || !err) {
        const goods = _.clone(values);
        const { dispatch } = this.props;

        const thumbs = [];
        goods.goodsImage.forEach((image) => {
          let name = image.name;
          if (image.response) {
            name = image.response.url.substr(image.response.url.lastIndexOf('/') + 1);
          }
          thumbs.push(name);
        });
        delete goods.goodsImage;
        goods.thumbs = thumbs;

        goods.onSale = goods.onSale ? 1 : 0;
        goods.isSendFree = goods.isSendFree ? 1 : 0;

        const tmpGoodsGroup = [];
        goods.goodsGroup.forEach((item) => {
          tmpGoodsGroup.push(item.value);
        });
        goods.goodsGroup = tmpGoodsGroup;

        goods.pointerCategory = {
          __type: 'Pointer',
          className: 'Category',
          objectId: goods.pointerCategory ? goods.pointerCategory : '',
        };

        goods.isRecommand = goods.isRecommand ? 1 : 0;

        goods.isNew = goods.isNew ? 1 : 0;

        goods.multiSku = goods.multiSku ? 1 : 0;

        if (values.keyword) {
          goods.keyword = values.keyword.toString();
        }

        delete goods.goodsSku;

        // 修改商品
        if (values.objectId) {
          let oldGoodsSku = _.clone(this.props.goods.goodsSku.results); // 获取原来GoodsSku
          let oldThumbs = _.clone(this.props.goods.goods.thumbs); // 获取原来的thumbs

          dispatch({
            type: 'goods/coverGoods',
            payload: goods,
          }).then(() => {
            // GoodsSku
            values.goodsSku.forEach((sku, index) => {
              const obj = _.clone(sku);
              // 删除控件附带的属性
              delete obj.isNew;
              delete obj.editable;
              delete obj.createdAt;
              delete obj.updatedAt;

              if (obj.objectId) {
                oldGoodsSku = oldGoodsSku.filter(i => i.objectId !== obj.objectId);
              }

              // GoodsSku有objectId的修改，无objectId的新增
              dispatch({
                type: obj.objectId ? 'goods/coverGoodsSku' : 'goods/storeGoodsSku',
                payload: {
                  ...obj,
                  order: index,
                  pointerGoods: {
                    __type: 'Pointer',
                    className: 'Goods',
                    objectId: values.objectId,
                  },
                },
              });
            });

            // 清除被删除的GoodsSku
            if (oldGoodsSku.length > 0) {
              oldGoodsSku.forEach((sku) => {
                if (sku.objectId) {
                  dispatch({
                    type: 'goods/removeGoodsSku',
                    payload: {
                      objectId: sku.objectId,
                    },
                  });
                }
              });
            }

            // 更改图片日志状态
            const { file } = this.props.file;
            goods.thumbs.forEach((i) => {
              const f = file.results.find(j => j.thumbUrl === i);
              if (f) {
                oldThumbs = oldThumbs.filter(k => k !== i);
                dispatch({
                  type: 'file/coverFile',
                  payload: {
                    objectId: f.objectId,
                    status: 'done',
                  },
                });
              }
            });
            oldThumbs.forEach((i) => {
              const f = file.results.find(j => j.thumbUrl === i);
              if (f) {
                dispatch({
                  type: 'file/coverFile',
                  payload: {
                    objectId: f.objectId,
                    status: 'removed',
                  },
                });
              }
            });

            this.props.history.goBack();
          });
        } else {
          // 添加商品
          dispatch({
            type: 'goods/storeGoods',
            payload: goods,
          }).then(() => {
            const objectId = this.props.goods.goods.objectId;
            if (objectId && values.goodsSku) {
              values.goodsSku.forEach((sku, index) => {
                const obj = _.clone(sku);
                // 删除控件附带的属性
                delete obj.isNew;
                delete obj.editable;
                dispatch({
                  type: 'goods/storeGoodsSku',
                  payload: {
                    ...obj,
                    order: index,
                    pointerGoods: {
                      __type: 'Pointer',
                      className: 'Goods',
                      objectId,
                    },
                  },
                });
              });

              // 更改图片日志状态
              const { file } = this.props.file;
              goods.thumbs.forEach((i) => {
                const f = file.results.find(j => j.thumbUrl === i);
                if (f) {
                  dispatch({
                    type: 'file/coverFile',
                    payload: {
                      objectId: f.objectId,
                      pointerClassName: 'Goods',
                      pointerObjectId: objectId,
                      status: 'done',
                    },
                  });
                }
              });

              this.props.history.goBack();
            }
          });
        }
      }
    });
  };

  handleCancel = () => {
    this.props.history.goBack();
  };

  render() {
    const { form, loading } = this.props;
    const { getFieldDecorator } = form;
    const { goods } = this.props.goods;
    const { editing } = this.state;

    const categorys = this.Tree(this.props.category.category.results, 'pointerCategory');
    const specs = this.Tree(this.props.spec.spec.results, 'pointerSpec');

    let error = false;
    if (editing && (goods === undefined || goods.error)) {
      error = true;
    }

    const goodsImages = goods && goods.thumbs ? goods.thumbs.map((i) => {
      return { uid: i, name: i, thumb: i, url: `${globalConfig.imageUrl}${i}` };
    }) : [];

    const { specColumns } = this.state;
    const { specDataSource } = this.state;

    // const groups = this.Tree(this.props.group.group.results, 'pointerGroup');
    const groups = this.props.group.group.results.map((item) => {
      item.label = item.name;
      item.value = item.objectId;
      if (item.pointerGroup && item.pointerGroup.objectId.length > 0) {
        item.parentGroup = item.pointerGroup.objectId;
      } else {
        item.parentGroup = null;
      }
      return item;
    });
    const goodsGroup = [];
    if (goods && goods.goodsGroup) {
      goods.goodsGroup.forEach((item) => {
        goodsGroup.push({
          value: item,
          label: '',
        });
      });
    }

    const { editorState } = this.state;

    let keyword = goods && goods.keyword ? goods.keyword || '' : '';
    // keyword 兼容老数据
    // 全局逗号置换空格
    // 全局多空格置换单空格
    // 去除首尾空格
    // 全局空格置换逗号
    keyword = keyword.replace(/,/g, ' ');
    keyword = keyword.replace(/\s+/g, ' ');
    keyword = keyword.trim();
    keyword = keyword.replace(/\s+/g, ',');
    keyword = keyword.length > 0 ? keyword.split(',') : [];
    // const keywordOption = keyword.map(i => (<Select.Option key={i}>{i}</Select.Option>));

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };

    const formItemLayoutNolabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 16, offset: 6 },
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

    return (
      loading ? (<Card style={{ textAlign: 'center' }}><Spin /></Card>) :
        (error ?
          (<Exception type="404" style={{ minHeight: 500, height: '80%' }} linkElement={Link} />) :
          (
            <div>
              <PageHeaderLayout>
                <div className={styles.goods}>
                  <Form>
                    <Card>
                      <Form.Item>
                        {getFieldDecorator('objectId', {
                          initialValue: goods ? goods.objectId || '' : '',
                        })(
                          <Input hidden />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="商品主图"
                      >
                        {getFieldDecorator('goodsImage', {
                          valuePropName: 'fileList',
                          initialValue: goodsImages,
                        })(
                          <UploadImage
                            listType="picture-card"
                            onSuccess={this.handleImageSuccess}
                          />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="商品标题"
                      >
                        {getFieldDecorator('title', {
                          initialValue: goods ? goods.title || '' : '',
                          rules: [
                            { required: true, message: '请输入商品标题！' },
                          ],
                        })(
                          <Input placeholder="给商品起一个通俗易懂的标题，该标题将在商城的商品标题显示..." />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="商品描述"
                      >
                        {getFieldDecorator('description', {
                          initialValue: goods ? goods.description || '' : '',
                          rules: [
                            { required: false, message: '请输入商品描述！' },
                          ],
                        })(
                          <TextArea
                            rows={2}
                            placeholder="请输入商品描述；该商品描述在商城的一些商品显示页中作为副标题显示。"
                          />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="商品名称"
                      >
                        {getFieldDecorator('goodsName', {
                          initialValue: goods ? goods.goodsName || '' : '',
                          rules: [
                            { required: false, message: '请输入商品名称！' },
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
                          initialValue: goods ? goods.goodsSn || '' : '',
                          rules: [
                            { required: false, message: '请输入商品编号！' },
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
                          initialValue: goods ? goods.price || 0 : 0,
                          rules: [
                            { required: true, message: '请输入商品单价！' },
                          ],
                        })(
                          <InputNumber
                            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                            onChange={this.handlePriceChange}
                            min={0}
                          />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="重量"
                      >
                        {getFieldDecorator('weight', {
                          initialValue: goods ? goods.weight || 0 : 0,
                          rules: [
                            { required: false, message: '请输入单件商品重量！' },
                          ],
                        })(
                          <InputNumber
                            min={0}
                            onChange={this.handleWeightChange}
                          />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="库存"
                      >
                        {getFieldDecorator('stock', {
                          initialValue: goods ? goods.stock || 0 : 0,
                          rules: [
                            { required: false, message: '请输入商品库存数量！' },
                          ],
                        })(
                          <InputNumber
                            min={0}
                            onChange={this.handleStockChange}
                          />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="是否包邮"
                      >
                        {getFieldDecorator('isSendFree', {
                          valuePropName: 'checked',
                          initialValue: goods && goods.isSendFree > 0,
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
                        {getFieldDecorator('onSale', {
                          valuePropName: 'checked',
                          initialValue: goods && goods.onSale > 0,
                          rules: [
                            { required: false, message: '请选择上架/下架！' },
                          ],
                        })(
                          <Switch checkedChildren="上架" unCheckedChildren="下架" />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="实物/虚拟"
                      >
                        {getFieldDecorator('goodsType', {
                          initialValue: goods ? goods.goodsType || 0 : 0,
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
                        {getFieldDecorator('stockCnf', {
                          initialValue: goods ? goods.stockCnf || 0 : 1,
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
                        label="零库存调整上下架"
                      >
                        {getFieldDecorator('zeroStock', {
                          initialValue: goods ? goods.zeroStock || 0 : 1,
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
                        {getFieldDecorator('goodsGroup', {
                          initialValue: goodsGroup,
                        })(
                          <TreeSelect
                            treeData={groups}
                            treeCheckable
                            showCheckedStrategy={TreeSelect.SHOW_ALL}
                            treeCheckStrictly
                            treeDataSimpleMode={{ id: 'objectId', pId: 'parentGroup', rootPId: null }}
                            placeholder="请选择商品分类"
                          />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="商品类目"
                      >
                        {getFieldDecorator('pointerCategory', {
                          initialValue: goods && goods.pointerCategory ? goods.pointerCategory.objectId || '' : '',
                          rules: [
                            { required: false, message: '请输入商品类目！' },
                          ],
                        })(
                          <TreeSelect
                            treeData={categorys}
                            placeholder="请选择商品类目"
                            onChange={value => this.handleCategoryChange(value)}
                          />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="商品多规格"
                      >
                        {getFieldDecorator('multiSku', {
                          valuePropName: 'checked',
                          initialValue: goods && goods.multiSku > 0,
                          rules: [
                            { required: false, message: '请选择商品是否多规格！' },
                          ],
                        })(
                          <Checkbox >是否多规格</Checkbox>
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="商品规格"
                      >
                        {getFieldDecorator('goodsSpec', {
                          initialValue: goods && goods.goodsSpec ? goods.goodsSpec : [],
                          rules: [
                            { required: false, message: '请选择商品规格！' },
                          ],
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
                        {getFieldDecorator('goodsSku', {
                          valuePropName: 'dataSource',
                          initialValue: specDataSource,
                        })(
                          <EditableTable
                            size="small"
                            columns={specColumns}
                            pagination={false}
                          />
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="推广栏目"
                      >
                        {getFieldDecorator('isRecommand', {
                          valuePropName: 'checked',
                          initialValue: goods && goods.isRecommand > 0,
                          rules: [
                            { required: false, message: '是否人气推荐！' },
                          ],
                        })(
                          <Checkbox>人气推荐</Checkbox>
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayoutNolabel}
                      >
                        {getFieldDecorator('isNew', {
                          valuePropName: 'checked',
                          initialValue: goods && goods.isNew > 0,
                          rules: [
                            { required: false, message: '是否新品首发！' },
                          ],
                        })(
                          <Checkbox>新品首发</Checkbox>
                        )}
                      </Form.Item>
                      <Form.Item
                        {...formItemLayout}
                        label="关键字"
                      >
                        {getFieldDecorator('keyword', {
                          initialValue: keyword,
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
                          />
                        )}
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
                <Button type="default" htmlType="button" onClick={e => this.handleCancel(e)} >取消</Button>
                <Button type="primary" htmlType="button" onClick={e => this.handleOK(e)} loading={loading} >保存</Button>
              </FooterToolbar>
            </div>
          )
        )
    );
  }
}
