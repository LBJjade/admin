import React from 'react';
import { Card, Tag, List } from 'antd';
import styles from './GoodsCard.less';
import globalConfig from '../../../config';
import Ellipsis from '../../../components/Ellipsis';


class GoodsCard extends React.PureComponent {
  handleClick = (e, item) => {
    if (this.props.onClick) {
      this.props.onClick(item);
    }
  };

  handelError = (e) => {
    e.preventDefault();
    e.target.src = 'http://becheer.com:1338/parse/files/bee/1d5250aa6277728a23308361d9099215_error.gif';
    e.target.onError = null;
  };

  render() {
    const { data, pagination } = this.props;

    const paginationProps = {
      showQuickJumper: true,
      ...pagination,
    };

    return (
      <div>
        <List
          rowKey="objectId"
          className={styles.showcase}
          grid={{ gutter: 24, lg: 4, md: 2, sm: 1, xs: 1 }}
          dataSource={[...data]}
          pagination={paginationProps}
          renderItem={(item) => {
            return (
              <List.Item key={item.objectId}>
                <Card
                  bordered={false}
                  hoverable
                  onClick={e => this.handleClick(e, item)}
                >
                  <div className={styles.card_header}>
                    {
                      // 轮播图样式有问题
                      // item.thumb ? item.thumb.map((i) => {
                      //   return (
                      //     <div>
                      //       <img className={styles.card_img} src={`${globalConfig.imageUrl}${i}`} alt="" />
                      //     </div>
                      //   );
                      // }) : null
                      // 列表暂时取首图
                      item.thumbs && item.thumbs.length > 0 ? (<div><img style={{ height: 218, width: 218 }} className={styles.card_img} onError={e => this.handelError(e)} src={`${globalConfig.imageUrl}${item.thumbs[0]}`} alt="" /></div>) : null
                    }
                  </div>
                  <div className={styles.card_content}>
                    <Ellipsis lines={1}>{item.title}</Ellipsis>
                    <h4>¥{item.price}</h4>
                  </div>
                  <div className={styles.card_footer}>
                    { item.pointerCategory && item.pointerCategory.name ? (<Tag color="cyan">{item.pointerCategory.name}</Tag>) : null}

                    <div className={styles.position}>
                      {
                        this.props.group && item.goodsGroup ?
                          item.goodsGroup.map((i) => {
                            const group = this.props.group.results.find(j => j.objectId === i);
                            if (group) {
                              // 多个Tag需要加key区分;
                              return (<Tag color="gold" key={group.objectId}>{group.name}</Tag>);
                            } else {
                              return null;
                            }
                          }) :
                          null
                      }
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
            }
          }
        />
        <List
          rowKey="objectId"
          className={styles.showcase}
          grid={{ gutter: 24, column: 4 }}
          dataSource={[...data]}
          pagination={paginationProps}
          renderItem={(item) => {
            return (
              <List.Item key={item.objectId}>
                <Card
                  bordered={false}
                  hoverable
                  onClick={e => this.handleClick(e, item)}
                  cover={item.thumbs && item.thumbs.length > 0 ? (<div><img className={styles.card_img_1} style={{ width: '100%' }} onError={e => this.handelError(e)} src={`${globalConfig.imageUrl}${item.thumbs[0]}`} alt="" /></div>) : null}
                  style={{ borderRadius: 20 }}
                >
                  <div className={styles.card_content}>
                    <h4>¥{item.price}</h4>
                    <Ellipsis lines={1}>{item.title}</Ellipsis>
                  </div>
                  <div className={styles.card_footer}>
                    { item.pointerCategory && item.pointerCategory.name ? (<Tag color="green">{item.pointerCategory.name}</Tag>) : null}

                    <div className={styles.position}>
                      {
                        this.props.group && item.goodsGroup ?
                          item.goodsGroup.map((i) => {
                            const group = this.props.group.results.find(j => j.objectId === i);
                            if (group) {
                              // 多个Tag需要加key区分;
                              return (<Tag color="magenta" key={group.objectId}>{group.name}</Tag>);
                            } else {
                              return null;
                            }
                          }) :
                          null
                      }
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
          }
          }
        />
        <List
          rowKey="objectId"
          className={styles.showcase}
          grid={{ gutter: 24, lg: 5, md: 2, sm: 1, xs: 1 }}
          dataSource={[...data]}
          pagination={paginationProps}
          renderItem={(item) => {
            return (
              <List.Item key={item.objectId}>
                <Card
                  style={{ width: 250 }}
                  cover={item.thumbs && item.thumbs.length > 0 ? (<div><img className={styles.card_img_1} style={{ width: '100%', height: '100%' }} onError={e => this.handelError(e)} src={`${globalConfig.imageUrl}${item.thumbs[0]}`} alt="" /></div>) : null}
                >
                  <Card.Meta
                    title={<h4 style={{ color: 'red' }}>¥{item.price}</h4>}
                    description={<Ellipsis lines={1}>{item.title}</Ellipsis>}
                  />
                  <div className={styles.card_footer}>
                    { item.pointerCategory && item.pointerCategory.name ? (<Tag color="green">{item.pointerCategory.name}</Tag>) : null}

                    <div>
                      {
                        this.props.group && item.goodsGroup ?
                          item.goodsGroup.map((i) => {
                            const group = this.props.group.results.find(j => j.objectId === i);
                            if (group) {
                              // 多个Tag需要加key区分;
                              return (<Tag color="magenta" key={group.objectId}>{group.name}</Tag>);
                            } else {
                              return null;
                            }
                          }) :
                          null
                      }
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
          }
          }
        />
      </div>
    );
  }
}

GoodsCard.propTypes = {};

export default GoodsCard;
