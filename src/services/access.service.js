"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN"
};
class AccessService {
  static login = async ({ email, password, refreshToken = null }) => {
    // 1 check email exists
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop not registered");
    }
    // 2 check password matches
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authentication error");
    }
    // 3 create AT and RT
    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");

    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      // save collection keyStore
      refreshToken: tokens.refreshToken,
      userId: foundShop._id,
      publicKey,
      privateKey
    });

    return {
      shop: getInfoData({
        fileds: ["_id", "email", "name"],
        object: foundShop
      }),
      tokens
    };
  };

  static signUp = async ({ name, email, password }) => {
    // try {
    // step 1: check email exist
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      // return {
      //   code: "xxx",
      //   message: "Shop already registered"
      // };
      throw new ConflictRequestError("Error: Shop already registered!");
    }
    // 2. hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. create new shop
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP]
    });

    if (newShop) {
      // created private key, and public key
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem"
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem"
      //   }
      // });

      const publicKey = crypto.randomBytes(64).toString("hex");
      const privateKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey }); // save collection keyStore

      const keyStore = KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey
      });

      if (!keyStore) {
        return {
          code: "xxx",
          message: "publicKeyString error"
        };
      }
      // console.log("publicKeyString::", publicKeyString);

      // const publickeyObject = crypto.createPublicKey(publicKeyString);

      // console.log("publickeyObject::", publickeyObject);
      // created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        //   publickeyObject,
        publicKey,
        privateKey
      );
      console.log(`Created Token successfully::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fileds: ["_id", "email", "name"],
            object: newShop
          }),
          tokens
        }
      };
    }
    return {
      code: 201,
      metadata: null
    };
    // } catch (error) {
    //   return {
    //     code: "xxx",
    //     message: error.message,
    //     status: "error"
    //   };
    // }
  };

  static logout = async ({ keyStore }) => {
    return await KeyTokenService.removeKeyById({ id: keyStore._id });
  };

  static handlerRefreshToken = async ({ refreshToken }) => {
    // check this token used?
    const foundToken = await KeyTokenService.findByRefreshTokenUsed({
      refreshToken
    });

    if (foundToken) {
      // decode token
      const { email, userId } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log(`email::`, email);
      console.log(`userId::`, userId);

      // delete token in keyStore
      await KeyTokenService.deleteKeyById({ userId });

      throw new ForbiddenError("Something went wrong! Please login again!");
    }
    // OK
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

    console.log(`holderToken::`, holderToken);
    if (!holderToken) {
      throw new AuthFailureError("Shop not registered! 1");
    }

    // verify token
    const { email, userId } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registered! 2");
    }

    // create new token pair
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );
    // update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken // add token used
      }
    });

    return {
      user: { userId, email },
      tokens
    };
  };

  static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById({ userId });
      throw new ForbiddenError("Something went wrong! Please login again!");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop not registered! 1");
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registered! 2");
    }

    // create new token pair
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );
    // update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken
      },
      $addToSet: {
        refreshTokensUsed: refreshToken // add token used
      }
    });

    return {
      user: { userId, email },
      tokens
    };
  };
}

module.exports = AccessService;
