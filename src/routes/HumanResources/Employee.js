import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
// import styles from './Employee.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

@connect()
export default class Employee extends PureComponent {
  // 构造函数，在创建组件的时候调用一次。
  constructor(props, context) {
    super(props);
    this.state = {};
    console.log(context);
  }

  getDefaultProps() {}

  // 组件即将挂载。在组件挂载之前调用一次。
  // 如果在这个函数里面调用setState，本次的render函数可以看到更新后的state，并且只渲染一次。
  componentWillMount() {}

  // 组件挂载之后。在组件挂载之后调用一次。
  // 这个时候，子主键也都挂载好了，可以在这里使用refs。
  componentDidMount() {}


  // 即将接收属性。
  // props是父组件传递给子组件的。
  // 父组件发生render的时候子组件就会调用，不管props有没有更新，也不管父子组件之间有没有数据交换。
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  // 组件挂载之后，每次调用setState后都会调用shouldComponentUpdate判断是否需要重新渲染组件。
  // 默认返回true，需要重新render。
  // 在比较复杂的应用里，有一些数据的改变并不影响界面展示，可以在这里做判断，优化渲染效率。
  // 避免无意义的渲染。
  // shouldComponentUpdate(nextProps, nextState) {
  //   if (!this.props.isEqual(nextProps) || !this.state.isEqual(nextState)) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // shouldComponentUpdate返回true或者调用forceUpdate之后，componentWillUpdate会被调用。
  // componentWillUpdate(nextProps, nextState) {}

  // 除了首次render之后调用componentDidMount，其它render结束之后都是调用componentDidUpdate。
  // componentDidUpdate() {}

  // componentWillUnmount() {}

  render() {
    return (
      <PageHeaderLayout title="人事档案" content="人力资源所有人员的个人资料及履行档案库">
        <Card>
          { 'Todo' }
        </Card>
      </PageHeaderLayout>
    );
  }
}
