import React from 'react';
import { Row, Col, Card, Icon, Carousel, Tag } from 'antd';
import styles from './GoodsCard.less';
import globalConfig from '../../../config';

class ImageCard extends React.Component {
  render() {
    const { imageData } = this.props;

    return (
      <div>
        <Row gutter={24} className={styles.showcase_2}>
          {
            imageData && imageData.map((v, k) => {
              return (
                <Col lg={6} key={k} >
                  <Card
                    bordered={false}
                    hoverable
                  >
                    <div className={styles.card_header}>
                      <Carousel>
                        { v.images.map((item) => {
                          return (
                            <div>
                              <img src={`${globalConfig.imageUrl}${item}`} alt="" />
                            </div>
                          );
                        }) }
                      </Carousel>
                    </div>
                    <div className={styles.card_content}>
                      <h4>¥{v.price}</h4>
                      <p>{v.title}</p>
                    </div>
                    <div className={styles.card_footer}>
                      <Tag color={v.categoryColor ? v.categoryColor : 'gold'}>{v.categoryName}</Tag>
                      <div className={styles.position}>
                        <Icon type="shop" style={{ margin: 5 }} />{v.shop}
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })
          }
        </Row>
      </div>
    );
  }
}

ImageCard.propTypes = {};

export default ImageCard;
