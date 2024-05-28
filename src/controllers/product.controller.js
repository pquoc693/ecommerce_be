"use strict";
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

const { SuccessResponse } = require("../core/success.response");
class ProductController {
  // createProduct = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: "Create New Product Successfully",
  //     metadata: await ProductService.createProduct(req.body.product_type, {
  //       ...req.body,
  //       product_shop: req.user.userId
  //     })
  //   }).send(res);
  // };

  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create New Product Successfully",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId
      })
    }).send(res);
  };

  /**
   * @description Publish Product
   * @param { ObjectId } product_id
   */
  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish Product Successfully",
      metadata: await ProductServiceV2.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id
      })
    }).send(res);
  };
  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Unpublish Product Successfully",
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id
      })
    }).send(res);
  };

  // Query
  /**
   * @description Get All Drafts For Shop
   * @param { Number } limit
   * @param { Number } skip
   * @return { JSON }
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list Drafts success!",
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId
      })
    }).send(res);
  };

  /**
   * @description Get All Publish For Shop
   * @param { Number } limit
   * @param { Number } skip
   * @return { JSON }
   */
  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Publish For Shop Successfully",
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId
      })
    }).send(res);
  };
  /**
   * @description Get List Search Products
   * @param { String } keySearch
   * @return { JSON }
   */
  searchProductsByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Search Products By User Successfully",
      metadata: await ProductServiceV2.searchProduct(req.params)
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Find all product Successfully",
      metadata: await ProductServiceV2.findAllProducts(req.query)
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Find product Successfully",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id
      })
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product Successfully",
      metadata: await ProductServiceV2.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId
        }
      )
    }).send(res);
  };
}

module.exports = new ProductController();
