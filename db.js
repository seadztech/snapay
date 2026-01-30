const mongoose = require("mongoose");
const Config = require("./Config");

module.exports = function connect() {
  // console.log("connection string: ", Config.DB_CONNECTION_STRING);
  mongoose.connect(Config.DB_CONNECTION_STRING);
};
