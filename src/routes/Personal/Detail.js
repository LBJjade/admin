import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'dva/router';
import { Avatar, Tag, Spin, Row, Col, Button, Input } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const { TextArea } = Input;

@connect(({ notices, loading }) => ({
  notices,
  loading: loading.models.notices,
}))
export default class BasicProfile extends Component {
  state = {
    loading: true,
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'notices/fetch',
      payload: {
        where: {
          objectId: this.props.match.params.id,
        },
      },
    }).then(() => {
      this.setState({
        loading: false,
      });
      dispatch({
        type: 'notices/coverInformation',
        payload: {
          ojId: this.props.match.params.id,
          fields: {
            read: true,
          },
        },
      });
    });
  }

  render() {
    const { notices: { data: { results } } } = this.props;
    const vaule = results[0];
    const color = {
      todo: '',
      processing: 'blue',
      urgent: 'red',
      doing: 'gold',
    };
    return (
      <div>
        {
          this.state.loading ? <div style={{ width: '100%', height: '100%' }}><Spin /></div> : (
            <PageHeaderLayout title={`${vaule.type}详情`}>
              <div style={{ height: 'auto', marginLeft: '250px', marginTop: '70px' }}>
                <div style={{ margin: 8 }}>
                  <Row>
                    <Col span={4}><div style={{ textAlign: 'right' }} /></Col>
                    <Col span={12} offset={1}><Avatar src={vaule === undefined ? '' : (vaule.avatar === undefined ? 'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png' : vaule.avatar)} shape="square" size="large" /></Col>
                  </Row>
                </div>
                <br />
                <div style={{ margin: 8 }}>
                  <Row>
                    <Col span={4}><div style={{ textAlign: 'right' }}>标题:</div></Col>
                    <Col span={12} offset={1}>{vaule === undefined ? '' : (vaule.title === undefined ? '暂无' : vaule.title)}</Col>
                  </Row>
                </div>
                <br />
                <div style={{ margin: 8 }}>
                  <Row>
                    <Col span={4}><div style={{ textAlign: 'right' }}>信息详情:</div></Col>
                    <Col span={12} offset={1}><TextArea style={{ minHeight: 32 }} value={vaule === undefined ? '' : (vaule.description === undefined ? '暂无' : vaule.description)} rows={8} readyOnly />
                    </Col>
                  </Row>
                </div>
                <br />
                <div style={{ margin: 8 }}>
                  <Row>
                    <Col span={4}><div style={{ textAlign: 'right' }}>状态:</div></Col>
                    <Col span={12} offset={1}><Tag color={vaule === undefined ? '' : color[`${vaule.status}`]} style={{ marginRight: 0 }}>{vaule === undefined ? '' : (vaule.extra === undefined ? '暂无' : vaule.extra)}</Tag></Col>
                  </Row>
                </div>
                <br />
                <div style={{ margin: 8 }}>
                  <Row>
                    <Col span={4}><div style={{ textAlign: 'right' }}>时间:</div></Col>
                    <Col span={12} offset={1}>{moment(vaule === undefined ? '' : vaule.createdAt).format('YYYY-MM-DD hh:mm')}</Col>
                  </Row>
                </div>
                <div style={{ marginTop: 30 }}>
                  <Row>
                    <Col span={12} offset={5}><Button type="primary" style={{ marginLeft: 8 }}><Link to="/personal/Notices">返回</Link></Button></Col>
                  </Row>
                </div>
              </div>
            </PageHeaderLayout>
)}
      </div>
    );
  }
}
