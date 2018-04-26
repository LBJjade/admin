import React, { PureComponent } from 'react';
import { Route, Redirect, Switch } from 'dva/router';
import { Steps } from 'antd';
// import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import NotFound from '../../Exception/404';
import { getRoutes } from '../../../utils/utils';
import styles from './index.less';

const { Step } = Steps;

export default class ForgetPassword extends PureComponent {
  componentWillMount() {

  }

  getCurrentStep() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    switch (pathList[pathList.length - 1]) {
      case 'info': return 0;
      case 'confirm': return 1;
      case 'request_password_reset': return 1;
      case 'result': return 2;
      default: return 0;
    }
  }

  toRedirect = () => {
    const curentStep = this.getCurrentStep();
    switch (curentStep) {
      case 0: return '/account/forgetpassword/info';
      case 1: return '/account/forgetpassword/cofirm';
      case 2: return '/account/forgetpassword/result';
      default: return '/account/forgetpassword/info';
    }
  }

  render() {
    const { match, routerData } = this.props;
    return (
      <div className={styles.main}>
        <h2>重置密码</h2>
        <div>
          <Steps current={this.getCurrentStep()} className={styles.steps}>
            <Step title="发送请求" />
            <Step title="重置密码" />
            <Step title="完成" />
          </Steps>
          <Switch>
            {
              getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))
            }
            <Redirect exact from="/account/forgetpassword" to={this.toRedirect()} />
            <Route render={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }
}
