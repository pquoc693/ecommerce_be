"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id"
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      // algorithm: "RS256",
      expiresIn: "2 days"
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      // algorithm: "RS256",
      expiresIn: "7 days"
    });

    // verifyToken
    JWT.verify(accessToken, publicKey, (error, decode) => {
      if (error) {
        console.log(`verify error::`, error);
      } else {
        console.log(`decode verify::`, decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  // check userId is missing
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");
  // get access token
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");
  // verify token
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    // check keyStore with this userId
    // ok all ==> return next
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid user");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = { createTokenPair, authentication };
