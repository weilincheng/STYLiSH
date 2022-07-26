const db = require("./model/db.js");
const queryPromise = db.queryPromise;
const shipping = "delivery",
  payment = "credit_card",
  subtotal = 36,
  freight = 16;
const fakeDataCount = 1000;
const totalRange = [100, 1000];
const userIdRange = [1, 5];

const generateRandomNumber = (range) => {
  const [lower, upper] = range;
  return Math.floor(Math.random() * (upper - lower + 1) + lower);
};

const insertFakeOrder = async (fakeDataCount) => {
  let sql = [
    `INSERT INTO orders (shipping, payment, subtotal, freight, total, user_id) VALUES`,
  ];

  for (let i = 0; i < fakeDataCount; i++) {
    const total = generateRandomNumber(totalRange);
    const user_id = generateRandomNumber(userIdRange);
    const curVal = `(
      ${db.escape(shipping)}, 
      ${db.escape(payment)}, 
      ${db.escape(subtotal)}, 
      ${db.escape(freight)}, 
      ${db.escape(total)},
      ${db.escape(user_id)}
    )`;
    sql.push(curVal);
    if (i === fakeDataCount - 1) {
      sql.push(";");
    } else {
      sql.push(",");
    }
  }
  // console.log(sql.join(""));
  const addOrder = await queryPromise(sql.join(""));
  console.log(addOrder);
};

insertFakeOrder(fakeDataCount);
