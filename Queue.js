const { Queue } = require("bullmq");

const smsQueue = new Queue("sms");

module.exports = smsQueue;
