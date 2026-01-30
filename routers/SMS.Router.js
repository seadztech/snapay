const router = require("express").Router();
const RequestHandler = require("../RequestHandler");

const { SMSsController } = require("../controllers");

router.get("/", (req, res) => {
  RequestHandler.sendSuccess(res, "SMSs listener is up and running...");
});

router.post("/", SMSsController.post);

module.exports = router;
