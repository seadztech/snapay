const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    transaction: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("MpesaTransaction", schema);

module.exports = model;
