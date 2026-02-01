const Config = require("./Config");
const Logger = require("./Logger");
const { SMS } = require("./models");
const Adapters = require("./adapters");

const { Worker } = require("bullmq");

const IORedis = require("ioredis");

const connection = new IORedis({ maxRetriesPerRequest: null });

const smsQueue = require("./Queue");

module.exports = class Process {
  // static async init() {
  //   while (true) {
  //     try {
  //       const smss = await Process.query();

  //       for (let sms of smss) {
  //         console.log(
  //           "Processing SMS ID: ",
  //           sms._id,
  //           " Adapter: ",

  //           sms.adapter,
  //           " Attempts: ",
  //           sms.attempts,
  //           " Message: ",
  //           sms.message
  //         );
  //         try {
  //           if (sms.status === "PENDING_SEND") {
  //             await Process.send(sms);
  //           } else {
  //             await Process.process(sms);
  //           }
  //         } catch (error) {
  //           await prisma.updateOne(
  //             { _id: sms._id },
  //             {
  //               status: "PROCESSED",
  //               RESULTS: "ERRORED",
  //               error: JSON.stringify({ message: error.message, error: error }),
  //             }
  //           );
  //         }
  //       }
  //     } catch (error) {
  //       Logger.error(error);
  //     }
  //   }
  // }

  static async init() {
    const smss = await Process.query();
    smss.forEach((sms) => smsQueue.add(sms._id, sms));

    new Worker(
      "sms",
      async (job) => {
        const sms = job.data;
        console.log("Processing SMS ID:", sms._id);
        try {
          if (sms.status === "PENDING_SEND") {
            await Process.send(sms);
          } else {
            await Process.process(sms);
          }
        } catch (error) {
          sms.status = "PROCESSED";
          sms.results = "ERRORED";
          sms.error = JSON.stringify({
            message: error.message,
            error: error,
          });

          await SMS.updateOne(
            { _id: sms._id },
            {
              status: sms.status,
              results: sms.results,
              error: sms.error,
            }
          );

          // await sms.save();
        }
      },
      { connection }
    );

    setInterval(async () => {
      console.log("....checking to reprocess pending sms.........");
      const pending =
        (await smsQueue.getWaitingCount()) + (await smsQueue.getActiveCount());

      if (pending > 0) {
        const smss = await Process.query();
        smss.forEach((sms) => smsQueue.add(sms._id, sms));
      }
    }, Config.PROCESS_POLLING_INTERVAL);
  }

  static async query() {
    const smss = await SMS.find({
      status: { $in: ["NEW", "PENDING_SEND"] },
      attempts: { $lt: Config.MAX_ATTEMPTS },
    })
      .sort({ createdAt: 1 })
      .limit(Config.SMS_BATCH)
      .populate("device");

    console.log("smss: ", smss.length);

    return smss;
  }

  static async process(sms) {
    switch (sms.adapter) {
      case "MPESA-TILL":
        Process.processMpesaTill(sms);

        break;
      case "MPESA":
        Process.processMpesa(sms);

        break;
      case "KCB":
        Process.processKCB(sms);
        break;
      case "WINAS":
        Process.processWinas(sms);
        break;
      case "NAWIRI":
        Process.processNawiri(sms);
        break;

      default:
        sms.status = "PROCESSED";
        sms.results = "FAILED";
        sms.error = "Unkown Adapter";
        await SMS.updateOne(
          { _id: sms._id },
          {
            status: sms.status,
            results: sms.results,
            error: sms.error,
          }
        );
        // await sms.save();
        break;
    }
  }

  static async processMpesaTill(sms) {
    let results = Adapters.MpesaTill(sms.message);

    sms.reference = results.reference;
    sms.amount = results.amount;
    sms.phoneNumber = results.senderPhone;
    sms.senderName = results.senderName;
    sms.transactionTime = results.transactionTime;
    sms.error = results.error;

    // await sms.save();

    await SMS.updateOne(
      { _id: sms._id },
      {
        reference: sms.reference,
        amount: sms.amount,
        phoneNumber: sms.phoneNumber,
        senderName: sms.senderName,
        transactionTime: sms.transactionTime,
        error: sms.error,
      }
    );

    if (sms.reference && sms.amount && !sms.error) {
      Process.send(sms);
    } else {
      sms.status = "PROCESSED";
      sms.results = "FAILED";

      await SMS.updateOne(
        { _id: sms._id },
        {
          status: sms.status,
          results: sms.results,
        }
      );

      // const saved = await sms.save();
    }
  }
  static async processMpesa(sms) {
    let results = Adapters.Mpesa(sms.message);

    sms.reference = results.reference;
    sms.amount = results.amount;
    sms.phoneNumber = results.senderPhone;
    sms.senderName = results.senderName;
    sms.transactionTime = results.transactionTime;
    sms.error = results.error;

    // await sms.save();

    await SMS.updateOne(
      { _id: sms._id },
      {
        reference: sms.reference,
        amount: sms.amount,
        phoneNumber: sms.phoneNumber,
        senderName: sms.senderName,
        transactionTime: sms.transactionTime,
        error: sms.error,
      }
    );

    if (sms.reference && sms.amount && !sms.error) {
      Process.send(sms);
    } else {
      sms.status = "PROCESSED";
      sms.results = "FAILED";

      await SMS.updateOne(
        { _id: sms._id },
        {
          status: sms.status,
          results: sms.results,
        }
      );

      // const saved = await sms.save();
    }
  }

  static async processKCB(sms) {
    const results = Adapters.KCB(sms.message);

    sms.reference = results.reference;
    sms.amount = results.amount;
    sms.senderName = results.senderName;
    sms.transactionTime = results.transactionTime;
    sms.error = results.error;
    sms.otherReference = results.transactionReference;
    await SMS.updateOne(
      { _id: sms._id },
      {
        reference: sms.reference,
        amount: sms.amount,
        senderName: sms.senderName,
        transactionTime: sms.transactionTime,
        error: sms.error,
        otherReference: sms.otherReference,
      }
    );
    // await sms.save();

    if (sms.reference && sms.amount && !sms.error) {
      Process.send(sms);
    } else {
      sms.status = "PROCESSED";
      sms.results = "FAILED";
      await SMS.updateOne(
        { _id: sms._id },
        {
          status: sms.status,
          results: sms.results,
        }
      );
      // await sms.save();
    }
  }

  static async processWinas(sms) {
    let results = Adapters.Winas(sms.message);

    sms.reference = results.reference;
    sms.amount = results.amount;
    sms.phoneNumber = results.senderNumber;
    sms.senderName = results.senderName;
    sms.account = results.account;
    sms.transactionTime = results.transactionTime;
    sms.error = results.error;

    // await sms.save();

    await SMS.updateOne(
      { _id: sms._id },
      {
        reference: sms.reference,
        amount: sms.amount,
        phoneNumber: sms.phoneNumber,
        senderName: sms.senderName,
        transactionTime: sms.transactionTime,
        error: sms.error,
        account: sms.account,
      }
    );

    if (sms.reference && sms.amount && !sms.error) {
      Process.send(sms);
    } else {
      sms.status = "PROCESSED";
      sms.results = "FAILED";

      await SMS.updateOne(
        { _id: sms._id },
        {
          status: sms.status,
          results: sms.results,
        }
      );

      // const saved = await sms.save();
    }
  }

  static async processNawiri(sms) {
    let results = Adapters.Nawiri(sms.message);

    sms.reference = results.reference;
    sms.amount = results.amount;
    sms.senderName = results.senderName;
    sms.account = results.account;
    sms.transactionTime = results.transactionTime;
    sms.error = results.error;

    // await sms.save();

    await SMS.updateOne(
      { _id: sms._id },
      {
        reference: sms.reference,
        amount: sms.amount,
        phoneNumber: sms.phoneNumber,
        senderName: sms.senderName,
        transactionTime: sms.transactionTime,
        error: sms.error,
        account: sms.account,
      }
    );

    if (sms.reference && sms.amount && !sms.error) {
      Process.send(sms);
    } else {
      sms.status = "PROCESSED";
      sms.results = "FAILED";

      await SMS.updateOne(
        { _id: sms._id },
        {
          status: sms.status,
          results: sms.results,
        }
      );

      // const saved = await sms.save();
    }
  }

  static async send(sms) {
    // console.log(sms);
    // const company = await this.getCompany(sms.device.companySID);
    // console.log("company: ", company);

    // if (!company) {
    //   sms.status = "PROCESSED";
    //   sms.results = "FAILED";
    //   sms.error = "Company Not Found";

    //   await SMS.updateOne(
    //     { _id: sms._id },
    //     {
    //       status: sms.status,
    //       results: sms.results,
    //       error: sms.error,
    //     }
    //   );
    //   // await sms.save();
    //   return;
    // }

    const url = `${'jeflo.seadztech.co.ke'}${Config.COMPANY_SMS_POST_PATH}`;
    
    // const url = `${'http://192.168.0.64/pharmacy/public'}${Config.COMPANY_SMS_POST_PATH}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sms),
    });

    const results = await response.json();

    sms.responseBody = JSON.stringify(results);

    sms.attempts = sms.attempts ? sms.attempts + 1 : 1;

    sms.status = response.ok ? "PROCESSED" : "PENDING_SEND";

    // await sms.save();
    await SMS.updateOne(
      { _id: sms._id },
      {
        responseBody: sms.responseBody,
        attempts: sms.attempts,
        status: sms.status,
      }
    );
  }

  static async getCompany(SID) {
    const url = `${Config.COMPANY_GET_URL}/${SID}`;

    const requestResponse = await fetch(url);

    const result = await requestResponse.json();

    return result;
  }
};
