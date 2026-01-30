const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companySID: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("Device", schema);

module.exports = model;
