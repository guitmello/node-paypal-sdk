const express = require("express");
const router = express.Router();

const paypalService = require("./service/paypal.service");

router.post("/pay", (req, res) => {
	paypalService.pay(req, res);
});

router.get("/success", (req, res) => {
	paypalService.success(req, res);
});

router.get("/cancel", () => {
	res.send("Cancelled");
});

module.exports = router;
