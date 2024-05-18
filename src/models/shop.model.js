"use strict";

const { default: mongoose, Schema, model } = require("mongoose");

const DOCUMENT_NAME = "shop";
const COLLECTION_NAME = "shops";

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150
    },
    email: {
      type: String,
      trim: true,
      unique: true
    },
    password: {
      type: String,
      require: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive"
    },
    verify: {
      type: Schema.Types.Boolean,
      default: false
    },
    roles: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

module.exports = model(DOCUMENT_NAME, shopSchema);
