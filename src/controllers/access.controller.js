"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    // try {
    //   console.log(`[P]::signUp::`, req.body);
    /*
                200 OK
                201 CREATED
            */
    // return res.status(201).json(await AccessService.signUp(req.body));
    // } catch (error) {
    //   next(error);
    // }

    new CREATED({
      message: "Registered OK",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10
      }
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body)
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout Successfully",
      metadata: await AccessService.logout({ keyStore: req.keyStore })
    }).send(res);
  };
}

module.exports = new AccessController();
