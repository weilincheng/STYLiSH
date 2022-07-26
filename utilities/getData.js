const Order = require("../model/order_model");
const endPoint = "http://35.75.145.100:1234/api/1.0/order/data";

const axios = require("axios").default;
async function getOrderInfo(url) {
  try {
    const result = await axios({
      method: "get",
      url,
    });
    return result.data;
  } catch (error) {
    console.log(error);
  }
}

const getData = async () => {
  const result = await getOrderInfo(endPoint);
  for (let order of result) {
    const orderInfo = {
      shipping: "delivery",
      payment: "credit_card",
      subtotal: 1,
      freight: 1,
      total: order.total,
      user_id: 1,
    };
    const orderId = await Order.insertOrder(orderInfo);
    const listInfo = order.list;
    const result = await Order.insertList(listInfo);
  }
};

getData();
