"use strict";

const {
  ProductModel,
  ClothingModel,
  ElectronicsModel,
  FurnitureModel
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
  findAllDraftsForShop,
  findAllPublishForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById
} = require("../models/repositories/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
const { insertInventory } = require("../models/repositories/inventory.repo");

// define factory class to create product
class ProductFactory {
  static productRegistry = {}; // key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];

    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }

    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];

    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }

    return new productClass(payload).updateProduct(productId);
  }

  // PUT //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }
  // END PUT //

  // query
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShop(query, limit, skip);
  }
  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };

    return await findAllPublishForShop({ query, limit, skip });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true }
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_price", "product_thumb", "product_shop"]
    });
  }

  static async findProduct({ product_id }) {
    return await findProduct({
      product_id,
      unSelect: ["__v"]
    });
  }

  static async searchProduct({ keySearch }) {
    return await searchProductByUser({
      keySearch
    });
  }

  // end query
}

// define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_shop,
    product_attributes,
    product_quantity
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_quantity = product_quantity;
  }

  //   create new product
  async createProduct(product_id) {
    const newProduct = await ProductModel.create({ ...this, _id: product_id });
    if (newProduct) {
      // add product_stock into inventory
      await insertInventory({
        productId: newProduct._id,
        shopId: newProduct.product_shop,
        stock: newProduct.product_quantity
      });
    }

    return newProduct;
  }

  // update product
  async updateProduct(productId, bodyUpdate) {
    // return await ProductModel.findByIdAndUpdate(productId, bodyUpdate, {
    //   new: true
    // });
    return await updateProductById({
      model: ProductModel,
      product_id: productId,
      bodyUpdate
    });
  }
}

// define sub-class for different product types  Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await ClothingModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });

    if (!newClothing) {
      throw new BadRequestError("Failed to create clothing product");
    }

    const newProduct = await super.createProduct(newClothing._id);

    if (!newProduct) {
      throw new BadRequestError("Failed to create product");
    }

    return newProduct;
  }
}

// Define sub-class for different product types: Electronics
class Electronics extends Product {
  // create new electronics product
  async createProduct() {
    const newElectronics = await ElectronicsModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });

    if (!newElectronics) {
      throw new BadRequestError("Failed to create electronics product");
    }

    const newProduct = await super.createProduct(newElectronics._id);

    if (!newProduct) {
      throw new BadRequestError("Failed to create product");
    }

    return newProduct;
  }
}

// Define sub-class for different product types: Furniture
class Furniture extends Product {
  // create new electronics product
  async createProduct() {
    const newFurniture = await FurnitureModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop
    });

    if (!newFurniture) {
      throw new BadRequestError("Failed to create furniture product");
    }

    const newProduct = await super.createProduct(newFurniture._id);

    if (!newProduct) {
      throw new BadRequestError("Failed to create product");
    }

    return newProduct;
  }

  async updateProduct(productId) {
    const objectParam = removeUndefinedObject(this);
    if (objectParam.product_attributes) {
      // update child
      // await ClothingModel.findByIdAndUpdate(productId, objectParam, {
      //   new: true
      // });
      await updateProductById({
        model: ClothingModel,
        product_id: productId,
        bodyUpdate: updateNestedObjectParser(objectParam.product_attributes)
      });
    }
    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObjectParser(objectParam)
    );
    return updateProduct;
  }
}

// register product types
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
