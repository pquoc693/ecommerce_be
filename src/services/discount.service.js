"use strict";

const { NotFoundError, BadRequestError } = require("../core/error.response");
const { parse, isValid } = require("date-fns");
const { discount: discountModel } = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
  findAllDiscountCodeUnSelect,
  checkDiscountExist
} = require("../models/repositories/discount.repo");

class DiscountService {
  constructor() {}

  //   Create discount code (shop | admin)
  static async createDiscountCode(payload) {
    const {
      name,
      description,
      type,
      value,
      code,
      is_active,
      start_date,
      end_date,
      max_uses,
      uses_count,
      applies_to,
      users_used,
      max_uses_per_user,
      min_order_value,
      shopId,
      product_ids,
      max_value
    } = payload;

    // Kiểm tra sự tồn tại của start_date và end_date
    if (!start_date || !end_date) {
      throw new BadRequestError("start_date and end_date are required");
    }

    // Chuyển đổi và kiểm tra định dạng ngày tháng
    const startDate = parse(start_date, "yyyy-MM-dd HH:mm:ss", new Date());
    const endDate = parse(end_date, "yyyy-MM-dd HH:mm:ss", new Date());

    if (!isValid(startDate) || !isValid(endDate)) {
      throw new BadRequestError("Invalid date format");
    }

    if (startDate >= endDate) {
      throw new BadRequestError(`start_date must be before end_date`);
    }

    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId)
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount exists");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_value: value,
      discount_code: code,
      discount_start_date: startDate,
      discount_end_date: endDate,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: convertToObjectIdMongodb(shopId),
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids
    });

    return newDiscount;
  }

  // ---------------------update discount code-------------------------
  static async updateDiscountCode() {}

  //-----------------get all discount code with product----------------
  static async getAllDiscountCodesWithProduct({ code, shopId, limit, page }) {
    console.log("code, shopId, limit, page", code, shopId, limit, page);
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId)
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exist");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products = [];
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublish: true
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"]
      });
    }

    console.log("discount_applies_to", discount_applies_to);

    if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"]
      });
    }

    return products;
  }

  // ------------------get all discount code by shop-------------------
  static async getAllDiscountCodesByShop({ limit, shopId, page }) {
    const discounts = await findAllDiscountCodeUnSelect({
      model: discountModel,
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true
      },
      unSelect: ["__v", "discount_shopId"]
    });
    return discounts;
  }

  // ------------------get all discount code by shop-------------------
  static async getDiscountAmount({ codeId, shopId, userId, products }) {
    const foundDiscount = await checkDiscountExist({
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId)
      },
      model: discountModel
    });

    if (!foundDiscount) {
      throw new NotFoundError(`Discount doesn't exist`);
    }

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_start_date,
      discount_end_date,
      discount_max_uses_per_user,
      discount_type,
      discount_value
    } = foundDiscount;

    if (!discount_is_active) {
      throw new NotFoundError("Discount expired");
    }

    if (!discount_max_uses) {
      throw new NotFoundError("Discount are out");
    }

    console.log("discount_start_date", discount_start_date);
    console.log("discount_end_date", discount_end_date);

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("Discount ecode has expired");
    }

    // check xem có set giá trị tối thiểu hay không?
    let totalOrder;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount requires a minium order value of ${discount_min_order_value}`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUsedDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userUsedDiscount) {
      }
    }

    // check xem amount là fixed or %
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount
    };
  }

  //---------------------delete discount code--------------------------
  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId)
    });

    return deleted;
  }

  //---------------------cancel discount code-------------------------
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExist({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId)
      }
    });

    if (!foundDiscount) {
      throw new NotFoundError(`Discount doen't exitst`);
    }

    const result = await discountModal.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId
      },
      $inc: {
        discount_max_uses: 1,
        discount_users_count: -1
      }
    });

    return result;
  }
}

module.exports = DiscountService;
