import { isUrl } from '../utils/utils';

const menuData = [{
  name: '控制台',
  icon: 'dashboard',
  path: 'dashboard',
  children: [{
    name: '工作台',
    path: 'workspace',
  }, {
    name: '分析页',
    path: 'analysis',
  }, {
    name: '监控页',
    path: 'monitor',
  }, {
    name: '工作台',
    path: 'workplace',
    hideInBreadcrumb: true,
    hideInMenu: true,
  }],
}, {
  name: '客户分析',
  icon: 'area-chart',
  path: 'analysis',
  hideInBreadcrumb: true,
  hideInMenu: true,
  children: [{
    name: '分析规则管理',
    path: 'analysissetting',
  }],
}, {
  name: '表单页',
  icon: 'form',
  path: 'form',
  hideInBreadcrumb: true,
  hideInMenu: true,
  children: [{
    name: '基础表单',
    path: 'basic-form',
  }, {
    name: '分步表单',
    path: 'step-form',
  }, {
    name: '高级表单',
    authority: 'admin',
    path: 'advanced-form',
  }],
}, {
  name: '列表页',
  icon: 'table',
  path: 'list',
  hideInBreadcrumb: true,
  hideInMenu: true,
  children: [{
    name: '查询表格',
    path: 'table-list',
  }, {
    name: '标准列表',
    path: 'basic-list',
  }, {
    name: '卡片列表',
    path: 'card-list',
  }, {
    name: '搜索列表',
    path: 'search',
    children: [{
      name: '搜索列表（文章）',
      path: 'articles',
    }, {
      name: '搜索列表（项目）',
      path: 'projects',
    }, {
      name: '搜索列表（应用）',
      path: 'applications',
    }],
  }],
}, {
  name: '详情页',
  icon: 'profile',
  path: 'profile',
  hideInBreadcrumb: true,
  hideInMenu: true,
  children: [{
    name: '基础详情页',
    path: 'basic',
  }, {
    name: '高级详情页',
    path: 'advanced',
    authority: 'admin',
  }],
}, {
  name: '结果页',
  icon: 'check-circle-o',
  path: 'result',
  hideInBreadcrumb: true,
  hideInMenu: true,
  children: [{
    name: '成功',
    path: 'success',
  }, {
    name: '失败',
    path: 'fail',
  }],
}, {
  name: '异常页',
  icon: 'warning',
  path: 'exception',
  hideInBreadcrumb: true,
  hideInMenu: true,
  children: [{
    name: '403',
    path: '403',
  }, {
    name: '404',
    path: '404',
  }, {
    name: '500',
    path: '500',
  }, {
    name: '触发异常',
    path: 'trigger',
    hideInMenu: true,
  }],
}, {
  name: '账户',
  icon: 'user',
  path: 'user',
  authority: 'guest',
  hideInBreadcrumb: true,
  hideInMenu: true,
  children: [{
    name: '登录',
    path: 'login',
  }, {
    name: '注册',
    path: 'register',
  }, {
    name: '注册结果',
    path: 'register-result',
  }],
}, {
  name: '个人中心',
  icon: 'user',
  path: 'personal',
  children: [{
    name: '个人设置',
    path: 'setting',
    // hideInMenu: true,
  }],
}, {
  name: '使用文档',
  icon: 'book',
  path: 'http://pro.ant.design/docs/getting-started',
  hideInBreadcrumb: true,
  hideInMenu: true,
  target: '_blank',
}, {
  name: '人力资源',
  icon: 'team',
  path: 'humanresources',
  hideInBreadcrumb: true,
  hideInMenu: true,
  authority: ['admin'],
  children: [{
    name: '人事档案',
    icon: 'user',
    path: 'employee',
  }],
}, {
  name: '系统管理',
  icon: 'setting',
  path: 'system',
  authority: ['admin'],
  children: [{
    name: '菜单管理',
    icon: 'bars',
    path: 'menu',
  }, {
    name: '用户管理',
    icon: 'user',
    path: 'user',
    // path: 'usertable',
  }, {
    name: '角色管理',
    icon: 'usergroup-add',
    path: 'role',
  }, {
    name: '角色权限',
    icon: 'team',
    path: 'roleuser',
  }],
}, {
  name: '基础数据',
  icon: 'user',
  path: 'basic',
  hideInBreadcrumb: true,
  hideInMenu: true,
  authority: ['admin', 'guest'],
  children: [{
    name: '城市管理',
    icon: 'environment-o',
    path: 'city',
  }, {
    name: '品牌管理',
    icon: 'trademark',
    path: 'brand',
  }, {
    name: '大区管理',
    icon: 'global',
    path: 'region',
  }, {
    name: '区域管理',
    icon: 'appstore-o',
    path: 'district',
  }, {
    name: '门店管理',
    icon: 'shop',
    path: 'shop',
  }],
}];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map((item) => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
