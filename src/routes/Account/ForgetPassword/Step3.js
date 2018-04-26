import React from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import { routerRedux } from 'dva/router';
import Result from '../../../components/Result';
import styles from './Style.less';

@connect(({ forgetpassword }) => ({
  data: forgetpassword.step,
}))
export default class Step3 extends React.PureComponent {
  render() {
    const { dispatch } = this.props;
    const onFinish = () => {
      dispatch(routerRedux.push('/account/login'));
    };
    const actions = (
      <div>
        <Button type="primary" onClick={onFinish}>
          登录
        </Button>
      </div>
    );
    return (
      <Result
        type="success"
        title="操作成功"
        description="密码已被重置，请记住密码。"
        // extra={information}
        actions={actions}
        className={styles.result}
      />
    );
  }
}

