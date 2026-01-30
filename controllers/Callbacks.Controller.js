const Config = require("../Config");
const Logger = require("../Logger");
const { MpesaTransaction } = require("../models");
const RequestHandler = require("../RequestHandler");

module.exports = class CallbacksController {
  static async confirm(req, res) {
    try {
      const body = req.body;

      console.log("body: ", body);

      const newTransaction = new MpesaTransaction({ transaction: body });

      newTransaction.save();

      const url = `${Config.C2B_APPLICATION_ENDPOINT}${req.path}`;
      console.log("url: ", url);

      const requestResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await requestResponse.json();

      // console.log("c2b endpoint response: ", requestResponse);

      console.log("c2b result: ", result);

      // await newTransaction.save();

      RequestHandler.sendSuccess(res, result, 200);
    } catch (error) {
      console.log(error);
      return RequestHandler.sendError(res, error);
    }
  }

  static async validate(req, res) {
    try {
      console.log("validation", Date.now());

      return RequestHandler.sendSuccess(
        res,
        { Resultcode: 0, ResultDesc: "Accepted" },
        200
      );
    } catch (error) {
      console.log(error);
      return RequestHandler.sendError(res, error);
    }
  }
};
