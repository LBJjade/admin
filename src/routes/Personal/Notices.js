import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { List, Card, Avatar, Tabs, Tag, Spin, message } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Notices.less';

@connect(({ notices, loading }) => ({
  notices,
  loading: loading.models.notices,
}))
export default class notices extends PureComponent {
  state = {
    noticeLoading: false,
    noticeHasMore: true,
    newsLoading: false,
    newsHasMore: true,
    needLoading: false,
    needHasMore: true,
    pagination: {
      pageSize: 6,
      current: 1,
      total: 0,
      count: {},
    },
    noticeCount: 0,
    newCount: 0,
    needCount: 0,
  }
  componentDidMount() {
    const { dispatch } = this.props;
    const parsedata = {
      limit: this.state.pagination.pageSize,
      skip: (this.state.pagination.current - 1) * this.state.pagination.pageSize,
      count: true,
    };
    dispatch({
      type: 'notices/fetchNotice',
      payload: {
        where: {
          type: '通知',
        },
        ...parsedata,
      },
    }).then(() => {
      this.setState({
        noticeCount: this.state.noticeCount + this.state.pagination.pageSize,
      });
    });
    dispatch({
      type: 'notices/fetchNews',
      payload: {
        where: {
          type: '消息',
        },
        ...parsedata,
      },
    }).then(() => {
      this.setState({
        newCount: this.state.newCount + this.state.pagination.pageSize,
      });
    });
    dispatch({
      type: 'notices/fetchNeed',
      payload: {
        where: {
          type: '待办',
        },
        ...parsedata,
      },
    }).then(() => {
      this.setState({
        needCount: this.state.needCount + this.state.pagination.pageSize,
      });
    });
  }

  changeRead = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'notices/coverInformation',
      payload: {
        objectId: id,
        fields: {
          read: true,
        },
      },
    });
  }

  handleInfiniteNoticeOnLoad = () => {
    const { notices: { notice } } = this.props;
    this.setState({
      noticeLoading: true,
    });
    const parsedata = {
      limit: this.state.pagination.pageSize,
      skip: this.state.noticeCount + 1,
      count: true,
    };
    if (this.state.noticeCount >= notice.count) {
      message.warning('已经没有数据了');
      this.setState({
        noticeHasMore: false,
        noticeLoading: false,
      });
      return;
    }
    this.props.dispatch({
      type: 'notices/fetchNewNotice',
      payload: {
        where: {
          type: '通知',
        },
        ...parsedata,
      },
    }).then(() => {
      this.setState({
        noticeLoading: false,
        noticeCount: this.state.noticeCount + this.state.pagination.pageSize,
      });
    });
  }

  handleInfiniteNewsOnLoad = () => {
    const { notices: { news } } = this.props;
    this.setState({
      newsLoading: true,
    });
    const parsedata = {
      limit: this.state.pagination.pageSize,
      skip: this.state.newCount + 1,
      count: true,
    };
    if (this.state.newCount >= news.count) {
      message.warning('已经没有数据了');
      this.setState({
        newsHasMore: false,
        newsLoading: false,
      });
      return;
    }
    this.props.dispatch({
      type: 'notices/fetchNewNotice',
      payload: {
        where: {
          type: '通知',
        },
        ...parsedata,
      },
    }).then(() => {
      this.setState({
        newsLoading: false,
        newCount: this.state.newCount + this.state.pagination.pageSize,
      });
    });
  }

  handleInfiniteNeedOnLoad = () => {
    const { notices: { need } } = this.props;
    this.setState({
      needLoading: true,
    });
    const parsedata = {
      limit: this.state.pagination.pageSize,
      skip: this.state.needCount + 1,
      count: true,
    };
    if (this.state.needCount >= need.count) {
      message.warning('已经没有数据了');
      this.setState({
        needHasMore: false,
        needLoading: false,
      });
      return;
    }
    this.props.dispatch({
      type: 'notices/fetchNewNeed',
      payload: {
        where: {
          type: '通知',
        },
        ...parsedata,
      },
    }).then(() => {
      this.setState({
        needLoading: false,
        needCount: this.state.needCount + this.state.pagination.pageSize,
      });
    });
  }

  render() {
    const { notices: { notice, news, need } } = this.props;
    const ListContent = ({ data: { createdAt } }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <span>收到时间</span>
          <p>{moment(createdAt).format('YYYY-MM-DD HH:mm')}</p>
        </div>
      </div>
    );
    const color = {
      todo: '',
      processing: 'blue',
      urgent: 'red',
      doing: 'gold',
    };

    return (
      <PageHeaderLayout title="消息中心">
        <div className={styles.standardList}>
          <Card>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="通知" key="1">
                <div className="demo-infinite-container" style={{ height: '455px', overflow: 'auto', padding: '6px' }}>
                  <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    loadMore={this.handleInfiniteNoticeOnLoad}
                    hasMore={!this.state.noticeLoading && this.state.noticeHasMore}
                    useWindow={false}
                  >
                    <List
                      dataSource={notice.results}
                      renderItem={item => (
                        <div style={{ opacity: item.read === true ? '0.6' : '', borderBottom: 'thin solid #e8e8e8' }}>
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar src={item.avatar} shape="square" size="large" />}
                              title={<Link to={`/personal/detail/${item.objectId}`}>{item.title === undefined ? '暂无' : item.title}</Link>}
                              description={<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '340px', height: '24px', display: 'block' }}> {item.description === undefined ? '暂无' : item.description} </span>}
                            />
                            <ListContent data={item} />
                          </List.Item>
                        </div>
                      )}
                    >
                      {this.state.noticeLoading && this.state.noticeHasMore && (
                        <div className="demo-loading-container">
                          <Spin />
                        </div>
                      )}
                    </List>
                  </InfiniteScroll>
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="消息" key="2">
                <div className="demo-infinite-container" style={{ height: '455px', overflow: 'auto', padding: '6px' }}>
                  <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    loadMore={this.handleInfiniteNewsOnLoad}
                    hasMore={!this.state.newsLoading && this.state.newsHasMore}
                    useWindow={false}
                  >
                    <List
                      dataSource={news.results}
                      renderItem={item => (
                        <div style={{ opacity: item.read === true ? '0.6' : '', borderBottom: 'thin solid #e8e8e8' }}>
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar src={item.avatar} shape="square" size="large" />}
                              title={<Link to={`/personal/detail/${item.objectId}`}>{item.title === undefined ? '暂无' : item.title}</Link>}
                              description={<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '340px', height: '24px', display: 'block' }}>{item.description === undefined ? '暂无' : item.description} </span>}
                            />
                            <ListContent data={item} />
                          </List.Item>
                        </div>
                      )}
                    >
                      {this.state.newsLoading && this.state.newsHasMore && (
                        <div className="demo-loading-container">
                          <Spin />
                        </div>
                      )}
                    </List>
                  </InfiniteScroll>
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="待办" key="3">
                <div className="demo-infinite-container" style={{ height: '455px', overflow: 'auto', padding: '6px' }}>
                  <InfiniteScroll
                    initialLoad={false}
                    pageStart={0}
                    loadMore={this.handleInfiniteNeedOnLoad}
                    hasMore={!this.state.needLoading && this.state.needHasMore}
                    useWindow={false}
                  >
                    <List
                      dataSource={need.results}
                      renderItem={item => (
                        <div style={{ opacity: item.read === true ? '0.6' : '', borderBottom: 'thin solid #e8e8e8' }}>
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar src={item.avatar} shape="square" size="large" />}
                              title={<Link to={`/personal/detail/${item.objectId}`}>{item.title === undefined ? '暂无' : item.title}</Link>}
                              description={<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '340px', height: '24px', display: 'block' }}> {item.description === undefined ? '暂无' : item.description} </span>}
                            />
                            <Tag color={item.status === undefined ? '' : color[`${item.status}`]}>{item.extra}</Tag>
                            <ListContent data={item} />
                          </List.Item>
                        </div>
                      )}
                    >
                      {this.state.needLoading && this.state.needHasMore && (
                        <div className="demo-loading-container">
                          <Spin />
                        </div>
                      )}
                    </List>
                  </InfiniteScroll>
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}
