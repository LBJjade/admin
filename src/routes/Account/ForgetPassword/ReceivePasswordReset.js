import React from 'react';
import { Button } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import Result from '../../../components/Result';
import styles from './ReceivePasswordReset.less';

@connect()
export default class ReceivePasswordReset extends React.PureComponent {
  state = {};

  componentDidMount() {
    const { dispatch, location } = this.props;
    dispatch(routerRedux.push(`/account/forgetpassword/confirm${location.search}`));
  }
  render() {
    const actions = (
      <div className={styles.actions}>
        <a href=""><Button size="large" type="primary">重置密码</Button></a>
      </div>
    );

    return (
      <Result
        className={styles.main}
        type="success"
        title={
          <div className={styles.title}>
            接收帐号重置密码！
          </div>
        }
        description=""
        actions={actions}
        style={{ marginTop: 56 }}
      />
    );
  }
}
