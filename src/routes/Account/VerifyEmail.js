import React from 'react';
import { Button } from 'antd';
// import { Link } from 'dva/router';
import { connect } from 'dva';
import Result from '../../components/Result';
import styles from './VerifyEmail.less';

@connect()
export default class VerifyEmail extends React.PureComponent {
  state={};

  componentDidMount() {
    const { dispatch, location } = this.props;
    dispatch({
      type: 'account/verifyEmail',
      payload: location.search,
    });
  }

  render() {
    const actions = (
      <div className={styles.actions}>
        <a href=""><Button size="large" type="primary">返回登录</Button></a>
      </div>
    );

    return (
      <Result
        className={styles.verifyResult}
        type="success"
        title={
          <div className={styles.title}>
            成功激活帐户！
          </div>
        }
        description=""
        actions={actions}
        style={{ marginTop: 56 }}
      />
    );
  }
}

