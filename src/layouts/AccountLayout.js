import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './AccountLayout.less';
import logo from '../assets/logo.svg';
import { getRoutes } from '../utils/utils';
import globalConfig from '../config';

const links = [{
  key: 'help',
  title: '帮助',
  href: '',
}, {
  key: 'privacy',
  title: '隐私',
  href: '',
}, {
  key: 'terms',
  title: '条款',
  href: '',
}];

class AccountLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = globalConfig.appName;
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - ${globalConfig.appName}`;
    }
    return title;
  }
  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={logo} />
                  <span className={styles.title}>{ globalConfig.appName }</span>
                </Link>
              </div>
              <div className={styles.desc}>当前最流行的Web视觉设计及UI设计规范</div>
            </div>
            <Switch>
              {getRoutes(match.path, routerData).map(item =>
                (
                  <Route
                    key={item.key}
                    path={item.path}
                    component={item.component}
                    exact={item.exact}
                  />
                )
              )}
              <Redirect exact from="/user" to="/user/login" />
            </Switch>
          </div>
          <GlobalFooter
            links={links}
            copyright={
              <Fragment>
                Copyright <Icon type="copyright" />{globalConfig.copyRight.title}
              </Fragment>
            }
          />
        </div>
      </DocumentTitle>
    );
  }
}

export default AccountLayout;
