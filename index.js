require("dotenv").config();

const Config = require("./Config");

const mongoose = require("mongoose");

const express = require("express");

const Process = require("./Process");
const smsQueue = require("./Queue");

const app = express();

const cors = require("cors");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  RequestHandler.sendSuccess(res, "snapay is up and running...");
});

const { callbacksRouter, SMSRouter } = require("./routers/index");

app.use("/callbacks", callbacksRouter);
app.use("/sms", SMSRouter);

app.get("/adapters", (req, res) => {
  res.status(200).json(Config.ADAPTERS);
});

const PORT = Config.PORT;

const connect = require("./db");
const RequestHandler = require("./RequestHandler");

connect();

mongoose.connection.on("connected", () => {
  console.log("database connected successfully");
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`snapay listening on http://0.0.0.0:${PORT}`);
  });
});

/**
 * Other routes are recorded as 404
 */
app.get("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    res,
    404,
    "The GET route you are trying to reach is not available"
  );
});

app.post("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    res,
    404,
    "The POST route you are trying to reach is not available"
  );
});

app.put("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    res,
    404,
    "The PUT route you are trying to reach is not available"
  );
});
app.patch("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    res,
    404,
    "The PATCH route you are trying to reach is not available"
  );
});

app.delete("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    res,
    404,
    "The DELETE route you are trying to reach is not available"
  );
});

Process.init();

module.exports = app;
