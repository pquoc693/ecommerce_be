"use strict";

const {
  ProductModel,
  ElectronicsModel,
  ClothingModel,
  FurnitureModel
} = require("../../models/product.model");
const { Types } = require("mongoose");
const {
  getSelectData,
  unGetSelectData,
  convertToObjectIdMongodb
} = require("../../utils");

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await ProductModel.find(
    {
      isPublished: true,
      $text: { $search: regexSearch }
    },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .lean();
  return results;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = await ProductModel.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

const findProduct = async ({ product_id, unSelect }) => {
  return await ProductModel.findById(product_id).select(
    unGetSelectData(unSelect)
  );
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await ProductModel.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id)
  });

  if (!foundShop) {
    return null;
  }
  foundShop.isDraft = false;
  foundShop.isPublished = true;

  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await ProductModel.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id)
  });

  if (!foundShop) {
    return null;
  }
  foundShop.isDraft = true;
  foundShop.isPublished = false;

  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

const updateProductById = async ({
  product_id,
  bodyUpdate,
  model,
  isNew = true
}) => {
  console.log("product_id", product_id);
  return await model.findByIdAndUpdate(product_id, bodyUpdate, { new: isNew });
};

const queryProduct = async ({ query, limit, skip }) => {
  return await ProductModel.find(query)
    .populate("product_shop", "name email -_id") // lấy name email, bỏ id
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const getProductById = async (productId) => {
  return await ProductModel.findOne(convertToObjectIdMongodb(productId)).lean();
};

const checkProductByServer = async (products) => {
  console.log("products", products);
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById(product.productId);
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId
        };
      }
    })
  );
};

module.exports = {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById,
  checkProductByServer
};
