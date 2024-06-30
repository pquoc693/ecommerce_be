"use strict";

const express = require("express");
const { apiKey, permission } = require("../auth/checkAuth");
const router = express.Router();
const { pushToLogDiscord } = require("../middlewares/toDiscord.js");

// check API key
router.use(apiKey);
// check permission
router.use(permission("0000"));
// add log to discord channel
router.use(pushToLogDiscord);

router.use("/v1/api/checkout", require("./checkout"));
router.use("/v1/api", require("./access"));
router.use("/v1/api/inventory", require("./inventory"));
router.use("/v1/api/product", require("./product"));
router.use("/v1/api/discount", require("./discount"));
router.use("/v1/api/cart", require("./cart"));

module.exports = router;
