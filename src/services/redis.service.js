"use strict";

const redis = require("redis");
const { promisify } = require("util"); // chuyển đổi hàm thành async/await
const {
  reservationInventory
} = require("../models/repositories/inventory.repo");
const redisClient = redis.createClient();

const pexpire = promisify(redisClient.pExpire).bind(redisClient);
const setnxAsync = promisify(redisClient.setNX).bind(redisClient);

// khi đặt hàng tạo key đưa cho người đi trước
// người đi trước đặt hàng xong trừ tồn kho xong trả lại key cho người khác vào
const acquireLock = async (productId, quantity, cartId) => {
  const key = `lock_v2024_${productId}`;
  //   thư lại được 10 lần, mỗi lần thử cách nhau 50ms
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes.length; i++) {
    // tạo một key, thằng nào nắm giữ được vào thanh toán
    // key không có ai giữ trả về 1
    // key đang bị giữ trả về 0
    const result = await setnxAsync(key, expireTime);
    console.log("acquireLock ~ result:", result);
    if (result === 1) {
      // thao tác với inventory
      const isReservetion = await reservationInventory({
        productId,
        cartId,
        quantity
      });
      if (isReservetion.modifiedCount) {
        await pexpire(key, expireTime);
        return key;
      }
    } else {
      // cách nhau 50ms
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

const releaseLock = async (keyLock) => {
  const delAsyncKey = promisify(redisClient.del).bind(redisClient);
  return await delAsyncKey(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock
};
