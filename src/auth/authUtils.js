"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
  REFRESHTOKEN: "x-rtoken-id"
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

const authenticationV2 = asyncHandler(async (req, res, next) => {
  // 1 - check userId missing ?

  const userId = req.headers[HEADER.CLIENT_ID];
  console.log("userId", userId);
  if (!userId) {
    throw new AuthFailureError("Invalid Request");
  }
  //  2 - get AccessToken
  const keyStore = await findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError("Not found keyStore");
  }
  // 3 - verify AccessToken
  if (req.headers[HEADER.REFRESHTOKEN]) {
    const refreshToken = req.headers[HEADER.REFRESHTOKEN];
    try {
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId != decodeUser.userId) {
        throw new AuthFailureError("Invalid Userid");
      }
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError("Invalid Request");
  }
  //  4 - check if user is valid
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId != decodeUser.userId) {
      throw new AuthFailureError("Invalid Userid");
    }
    req.keyStore = keyStore;
    req.user = decodeUser;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT
};
