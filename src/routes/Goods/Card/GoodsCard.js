import React from 'react';
import { Card, Icon, Tag, List, Button, Carousel } from 'antd';
import styles from './GoodsCard.less';
import globalConfig from '../../../config';
import Ellipsis from '../../../components/Ellipsis';


class GoodsCard extends React.PureComponent {
  handleClick = (e, item) => {
    if (this.props.onClick) {
      this.props.onClick(item);
    }
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
          grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
          dataSource={[...data]}
          pagination={paginationProps}
          renderItem={(item) => {
            return item ? (
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
                      item.thumbs ? (<div><img className={styles.card_img} src={`${globalConfig.imageUrl}${item.thumbs[0]}`} alt="" /></div>) : null
                    }
                  </div>
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
                              return (<Tag color="magenta">{group.name}</Tag>);
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
            ) : (
              <List.Item>
                <Card
                  bordered={false}
                  hoverable
                >
                  <Button type="dashed">
                    <Icon type="plus" /> 新增产品
                  </Button>
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
