"use strict";

const { default: mongoose } = require("mongoose");
const { countConnect } = require("../helpers/check.connect");
const {
  db: { user_name, password, port, host }
} = require("../configs/config.mongodb");

// const config = require("../configs/config.mongodb");

// console.log("config", config);

const connectString = `mongodb://${user_name}:${password}@${host}:${port}`;

class Database {
  constructor() {
    this.connect();
  }
  connect(type = "mongo") {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString, {
        maxPoolSize: 50
      })
      .then((_) =>
        console.log("Connected Mongoose successfully", countConnect())
      )
      .catch((err) => {
        console.log("Error connecting");
      });
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongoDB = Database.getInstance();
module.exports = instanceMongoDB;
