const redis = require("redis");

class RedisPublishService {
  constructor() {
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();
  }

  async publish(channel, message) {
    return new Promise((resolve, reject) => {
      this.publisher.publish(channel, message, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async subscribe(channel, callback) {
    this.subscriber.subscribe(channel);
    this.subscriber.on("message", (subscriberchannel, message) => {
      if (channel === subscriberchannel) {
        try {
          callback(channel, message);
        } catch (callbackError) {
          console.error("Error in callback:", callbackError);
        }
      }
    });
  }
}

module.exports = new RedisPublishService();
