const mongoose = require("mongoose");

const STATUS = Object.freeze({
  NEW: "NEW",
  PENDING_SEND: "PENDING_SEND",
  PROCESSED: "PROCESSED",
});

const RESULTS = Object.freeze({
  SUCEEDED: "SUCEEDED",
  ERRORED: "ERRORED",
  FAILED: "FAILED",
});

const schema = new mongoose.Schema(
  {
    timestamp: Number,
    message: String,
    sender: String,
    adapter: String,
    status: {
      type: String,
      enum: Object.values(STATUS),
    },
    results: {
      type: String,
      enum: Object.values(RESULTS),
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Device",
    },
    reference: String,
    amount: Number,
    phoneNumber: String,
    senderName: String,
    transactionTime: Date,
    error: String,
    account: String,
    attempts: { type: Number, default: 0 },
    responseBody: String,
    otherReference: String,
  },
  { timestamps: true }
);

const model = mongoose.model("SMS", schema);

module.exports = model;
