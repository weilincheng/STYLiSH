const express = require("express");
const router = express.Router();
const db = require("../model/db.js");
const queryPromise = db.queryPromise;
const {
  generateResponseFromPaymentSum,
  sumPayment,
} = require("../utilities/payment.js");

router.get("/payments", async (req, res) => {
  let sql = `select user_id, total FROM orders`;
  const result = await queryPromise(sql);
  const userPayment = sumPayment(result);
  const response = generateResponseFromPaymentSum(userPayment);
  res.json({ data: response });
});

module.exports = router;
