"use strict";

const express = require("express");
const cartController = require("../../controllers/cart.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();

router.post("", asyncHandler(cartController.addToCart));
router.delete("", asyncHandler(cartController.deleteItemCart));
router.post("/update", asyncHandler(cartController.updateCart));
router.get("", asyncHandler(cartController.getListCart));

module.exports = router;
