const db = require("./db.js");
const queryPromise = db.queryPromise;

const insertOrder = async (orderInfo) => {
  let sql = `
INSERT INTO orders 
    (shipping, payment, subtotal, freight, total, user_id)
VALUES 
    (${db.escape(orderInfo.shipping)}, 
    ${db.escape(orderInfo.payment)}, 
    ${db.escape(orderInfo.subtotal)}, 
    ${db.escape(orderInfo.freight)}, 
    ${db.escape(orderInfo.total)},
    ${db.escape(orderInfo.user_id)}
    )`;

  const addOrderResult = await queryPromise(sql);
  const orderId = addOrderResult.insertId;
  return orderId;
};

const insertList = async (listInfo) => {
  for (let list of listInfo) {
    let sql = `
          INSERT INTO list
              (name, price, color_name, color_code, size, qty, order_id, product_id)
          VALUES
              ("A",
              ${db.escape(list.price)},
              ${db.escape(list.color.name)},
              ${db.escape(list.color.code)},
              ${db.escape(list.size)},
              ${db.escape(list.qty)},
              1,
              ${db.escape(list.id)})`;
    const addListResult = await queryPromise(sql);
  }
};

const getTotalRevenue = async () => {
  let sql = `select sum(total) as total_revenue from orders`;
  const [result] = await queryPromise(sql);
  return result;
};

const getColorCount = async () => {
  const sql = `select color_name, color_code, count(*) as count from list group by color_name;`;
  const [...result] = await queryPromise(sql);
  return result;
};

const getPriceQuantity = async () => {
  const sql = `select price, qty from list`;
  const [...result] = await queryPromise(sql);
  return result;
};

const getTop5Products = async () => {
  const sql = `select product_id, sum(qty) as total_count from list group by product_id ORDER BY total_count DESC limit 5`;
  const [...result] = await queryPromise(sql);
  return result;
};

const getProductSizeCount = async (productId) => {
  const sql = `select product_id, size, sum(qty) as size_count from list where product_id='${productId}' group by size`;
  const [...result] = await queryPromise(sql);
  return result;
};

module.exports = {
  insertOrder,
  insertList,
  getTotalRevenue,
  getColorCount,
  getPriceQuantity,
  getTop5Products,
  getProductSizeCount,
};
