const RedisPublishService = require("../services/redis.Publish.service");

class ProductServiceTest {
  purchaseProduct({ productId, quantity }) {
    const order = {
      productId,
      quantity
    };
    console.log("productId1111", productId);
    RedisPublishService.publish("purchase_EVENTS", JSON.stringify(order));
  }
}

module.exports = new ProductServiceTest();
