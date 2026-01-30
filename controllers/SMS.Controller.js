const Config = require("../Config");
const Logger = require("../Logger");
const { MpesaTransaction, SMS, Device } = require("../models");
const RequestHandler = require("../RequestHandler");
const smsQueue = require("../Queue");

module.exports = class CallbacksController {
  static async post(req, res) {
    try {
      const body = req.body;

      const { deviceId, SMSs } = body;

      console.log("New SMS: ", JSON.stringify(body));

      const device = await Device.findById(deviceId);

      if (!device) {
        RequestHandler.throwError(400, "Invalid Device")();
      }

      for (let sms of SMSs) {
        try {
          const { sender, message, timestamp, adapter } = sms;

          const sameSms = await SMS.findOne({
            sender: sender,
            message: message,
            adapter: adapter,
            // deviceId: deviceId,
          });

          if (!sameSms) {
            const sms = await SMS.create({
              attempts: 0,
              message,
              sender,
              adapter,
              timestamp,
              status: "NEW",
              device: deviceId,
            });

            sms.device = device;
            smsQueue.add(sms._id, sms);
          }
        } catch (error) {
          Logger.error(JSON.stringify({ error, sms }));
        }
      }

      RequestHandler.sendSuccess(res, "SMSs Saved Successfully", 200);
    } catch (error) {
      RequestHandler.sendError(res, error);
    }
  }
};
