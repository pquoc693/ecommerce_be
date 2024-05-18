"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const router = express.Router();

router.post("/shop/signup", asyncHandler(accessController.signUp));
// router.get("/", (req, res, next) => {
//   return res.status(200).json({
//     message: "Welcome"
//   });
// });

module.exports = router;
