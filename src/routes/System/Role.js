import React, { PureComponent } from 'react';
import { connect } from 'dva';
import styles from './Role.less';

@connect(({ role, loading }) => ({
  role,
  loading: loading.models.role,
}))
export default class Role extends PureComponent {
  state = {};

  render() {
    return (
      <div>Hello</div>
    );
  }
}
