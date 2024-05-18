"use strict";

const { default: mongoose } = require("mongoose");
const os = require("os");
const process = require("process");
const _SECOND = 5000;

const countConnect = () => {
  const numConnections = mongoose.connect.length;
  console.log("Number of connections: " + numConnections);
};

const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connect.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    // Example maximum number of connections based on number of cores
    const maxConnections = numCores * 5;

    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);
    console.log(`Active connections: ${numConnections}`);
    if (numConnections > maxConnections) {
      console.log("Connection overload detected!");
    }
  }, _SECOND); // monitor every 5 seconds
};

module.exports = {
  countConnect,
  checkOverload
};
