"use strict";

const keyTokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    console.log("shjsshjhsshhs 111111");
    try {
      console.log("shjsshjhsshhs 222222");
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey,
        privateKey
      });
      console.log("shjsshjhsshhs 33333");
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = KeyTokenService;
