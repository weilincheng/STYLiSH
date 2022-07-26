const express = require("express");
const router = express.Router();
const db = require("../model/db.js");
const queryPromise = db.queryPromise;
const partnerKey =
  "partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG";
const tapPayUrl = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime";
const merchantId = "AppWorksSchool_CTBC";
const axios = require("axios").default;
const { authUser } = require("../middleware/auth.js");
const userPermission = ["admin", "user"];

async function axiosPost(headers, body, url) {
  try {
    const postResult = await axios({
      method: "post",
      headers,
      url,
      data: body,
    });
    return postResult.data;
  } catch (error) {
    console.log(error);
  }
}

router.post("*", authUser(userPermission));

router.post("/checkout", async (req, res) => {
  const io = req.app.get("socketio");
  if (!req.is("application/json")) {
    return res.status(400).json({ error: "Invalid Json Content" });
  }
  const prime = req.body.prime;
  const orderInfo = req.body.order;
  const recipient = orderInfo.recipient;
  const listInfo = req.body.list;
  const user_id = req.body.user_id;
  let orderId;
  try {
    // Add order into database
    let sql = `
            INSERT INTO orders 
                (shipping, payment, subtotal, freight, total, user_id)
            VALUES 
                (${db.escape(orderInfo.shipping)}, 
                ${db.escape(orderInfo.payment)}, 
                ${db.escape(orderInfo.subtotal)}, 
                ${db.escape(orderInfo.freight)}, 
                ${db.escape(orderInfo.total)},
                ${db.escape(user_id)}
                )`;

    const addOrderResult = await queryPromise(sql);
    orderId = addOrderResult.insertId;

    // Add recipient
    sql = `
            INSERT INTO recipient
                (name, phone, email, address, time, order_id)
            VALUES
                (${db.escape(recipient.name)},
                ${db.escape(recipient.phone)},
                ${db.escape(recipient.email)},
                ${db.escape(recipient.address)},
                ${db.escape(recipient.time)},
                ${db.escape(orderId)})`;
    const addRecipientResult = await queryPromise(sql);
    for (let list of listInfo) {
      sql = `
            INSERT INTO list
                (name, price, color_name, color_code, size, qty, order_id, product_id)
            VALUES
                (${db.escape(list.name)},
                ${db.escape(list.price)},
                ${db.escape(list.color.name)},
                ${db.escape(list.color.code)},
                ${db.escape(list.size)},
                ${db.escape(list.qty)},
                ${db.escape(orderId)},
                ${db.escape(list.id)})`;
      const addListResult = await queryPromise(sql);
    }
    console.log("Receieved new order");
    io.emit("new order");
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: "Order creation failed!" });
  }

  // Send prime to TapPay
  // const tapPayUrl = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime";
  const tapPayHeaders = {
    "Content-Type": "application/json",
    "x-api-key": partnerKey,
  };
  const tapPayBody = {
    prime,
    partner_key: partnerKey,
    merchant_id: merchantId,
    details: `TapPay transaction for order: ${orderId}`,
    amount: orderInfo.total,
    cardholder: {
      phone_number: recipient.phone,
      name: recipient.name,
      email: recipient.email,
      zip_code: "",
      address: recipient.address,
      national_id: "",
    },
    remember: true,
  };
  const tapPayResult = await axiosPost(tapPayHeaders, tapPayBody, tapPayUrl);
  // console.log(tapPayResult);
  const recTradeId = tapPayResult.rec_trade_id;
  // console.log(recTradeId);
  //
  if (tapPayResult.status === 0) {
    // Store recTradeId in database
    let sql = `
        UPDATE orders SET recTradeId = ${db.escape(recTradeId)} 
        WHERE id = ${db.escape(orderId)}`;
    try {
      const addrecTradeIdResult = await queryPromise(sql);
      res.status(200).json({
        data: {
          number: orderId,
        },
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.status(403).json({
      status: "fail",
      message: "Payment is failed!",
    });
  }
});

module.exports = router;
