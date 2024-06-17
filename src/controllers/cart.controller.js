"use strict";

const CartService = require("../services/cart.service");
const { SuccessResponse } = require("../core/success.response");

class CartController {
  /**
   * @desc add to cart for user
   * @param {int} userId
   * @param {*} ...
   * @param {*} ...
   * @method POST
   * @url
   * @return {
   * }
   */
  //--------------------add to cart------------------------
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new cart success",
      metadata: await CartService.addToCart(req.body)
    }).send(res);
  };

  //--------------------update cart +- . ------------------------
  updateCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Update cart success",
      metadata: await CartService.addToCartV2(req.body)
    }).send(res);
  };

  //--------------------delete cart------------------------
  deleteItemCart = async (req, res, next) => {
    new SuccessResponse({
      message: "delete cart success",
      metadata: await CartService.deleteItemCart(req.body)
    }).send(res);
  };

  //--------------------get list cart------------------------
  getListCart = async (req, res, next) => {
    new SuccessResponse({
      message: "List cart success",
      metadata: await CartService.getListCart(req.query)
    }).send(res);
  };
}

module.exports = new CartController();
