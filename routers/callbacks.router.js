const router = require("express").Router();
const RequestHandler = require("../RequestHandler");

const { CallbacksController } = require("../controllers");

router.get("/", (req, res) => {
  RequestHandler.sendSuccess(res, "callbacks is up and working...");
});

router.post("/confirm", CallbacksController.confirm);

module.exports = router;
