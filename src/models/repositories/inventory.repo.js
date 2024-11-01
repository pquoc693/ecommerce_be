"use strict";

const { convertToObjectIdMongodb } = require("../../utils");
const { inventory } = require("../inventory.model");
const { Types } = require("mongoose");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "unKnow"
}) => {
  return await inventory.create({
    inven_product: productId,
    inven_shopId: shopId,
    iven_stock: stock,
    inven_location: location
  });
};

const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
      inven_product: convertToObjectIdMongodb(productId),
      inven_stock: { $gte: quantity } // greater than quantity
    },
    updateSet = {
      $inc: {
        inven_stock: -quantity
      },
      $push: {
        inven_reservations: {
          quantity,
          cartId,
          createOn: new Date()
        }
      }
    },
    options = { upsert: true, new: true };

  return await inventory.updateOne(query, updateSet, options);
};

module.exports = {
  insertInventory,
  reservationInventory
};
