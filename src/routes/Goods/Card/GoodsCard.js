import React from 'react';
import { Card, Icon, Tag, List, Button } from 'antd';
import styles from './GoodsCard.less';
import globalConfig from '../../../config';


class GoodsCard extends React.PureComponent {
  handleClick = (e, item) => {
    if (this.props.onClick) {
      this.props.onClick(item);
    }
  };

  render() {
    const { data } = this.props;

    return (
      <div>
        <List
          rowKey="objectId"
          className={styles.showcase}
          grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
          dataSource={[...data]}
          renderItem={(item) => {
              return item ? (
                <List.Item key={item.objectId}>
                  <Card
                    bordered={false}
                    hoverable
                    onClick={e => this.handleClick(e, item)}
                  >
                    <div className={styles.card_header}>
                      <img className={styles.card_img} src={`${globalConfig.imageUrl}${item.thumb}`} alt="" />
                    </div>
                    <div className={styles.card_content}>
                      <h4>¥{item.price}</h4>
                      <div className={styles.card_content_title}>
                        <p>{item.title}</p>
                      </div>
                    </div>
                    <div className={styles.card_footer}>
                      <Tag color={item.categoryColor ? item.categoryColor : 'gold'}>分类</Tag>
                      <div className={styles.position}>
                        <Icon type="shop" style={{ margin: 5 }} />店名
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
