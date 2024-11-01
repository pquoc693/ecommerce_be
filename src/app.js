require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// init middleware
app.use(morgan("dev")); // check log
// morgan("combined");
// morgan("common");
// morgan("short");
// morgan("tiny");
app.use(helmet()); // prevent check information of server
app.use(compression()); // reduce size of response
// app.use(express.json());
// app.use(
//   express.urlencoded({
//     extended: true
//   })
// );
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// ---------------------Test publish subscribe REDIS---------------------
// const call_purchaseProduct_test = require("./test/subscribe.product.test"); // gọi publish
// call_purchaseProduct_test.purchaseProduct({
//   productId: "6652b698de3bc2c7d3191425",
//   quantity: 10
// });
// require("./test/subscribe.inventory.test"); // subscriber sẽ lắng nghe và hanlde update inventory
// ---------------------Test publish subscribe REDIS---------------------

// init DB
require("./dbs/init.mongodb");
const { checkOverload } = require("./helpers/check.connect");
// checkOverload();
// init routes
app.use("", require("./routes"));

// handle errors
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  return res.status(status).json({
    status: "error",
    code: status,
    stack: error.stack,
    message: error.message || "Internal server error"
  });
});

module.exports = app;
