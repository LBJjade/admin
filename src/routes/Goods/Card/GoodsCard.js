import React from 'react';
import { Card, Tag, List, Carousel } from 'antd';
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
                  style={{ minWidth: 266, minHeight: 337 }}
                >
                  <div style={{ width: 218, height: 218 }} className={styles.card_header}>
                    <Carousel effect="fade" autoplay>
                      {
                      (
                        item.thumbs === undefined ? '' : item.thumbs.map(k => (
                          <div className={styles.card_header}>
                            <img style={{ width: 218, height: 218 }} className={styles.card_img} onError={e => this.handelError(e)} src={`${globalConfig.imageUrl}${k}`} alt="" />
                          </div>
                        ))
                      )
                      // item.thumbs && item.thumbs.length > 0 ? (<div><img style={{ height: 218, width: 218 }} className={styles.card_img} onError={e => this.handelError(e)} src={`${globalConfig.imageUrl}${item.thumbs[1]}`} alt="" /></div>) : null
                    }
                    </Carousel>
                  </div>
                  <div onClick={e => this.handleClick(e, item)} className={styles.card_content}>
                    <Ellipsis lines={1}><div style={{ color: '#afafaf' }}>{item.title}</div></Ellipsis>
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
      </div>
    );
  }
}

GoodsCard.propTypes = {};

export default GoodsCard;
