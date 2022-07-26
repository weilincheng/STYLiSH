const Order = require("../model/order_model");

const getTotalRevenue = async () => {
  const result = await Order.getTotalRevenue();
  return result;
};

const getColorCount = async () => {
  const result = await Order.getColorCount();
  return result;
};

const getPriceQuantity = async () => {
  const result = await Order.getPriceQuantity();
  return result;
};

const getTop5Products = async () => {
  let result = [];
  const top5Products = await Order.getTop5Products();
  for (let product of top5Products) {
    let sizeInfo = {};
    const productSizeCount = await Order.getProductSizeCount(
      product.product_id
    );
    for (let item of productSizeCount) {
      sizeInfo[item.size] = item.size_count;
    }
    result.push({ product_id: product.product_id, sizeInfo });
  }
  return result;
};

module.exports = {
  getTotalRevenue,
  getColorCount,
  getPriceQuantity,
  getTop5Products,
};
