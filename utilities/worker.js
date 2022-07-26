require("dotenv").config();
const { Worker } = require("bullmq");
const { sumPayment, generateResponseFromPaymentSum } = require("./payment.js");
const QUEUE_NAME = "payments";
const db = require("../model/db.js");
const queryPromise = db.queryPromise;

const getPaymentFromDB = async () => {
  let sql = `select user_id, total FROM orders`;
  const result = await queryPromise(sql);
  return result;
};

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const result = await getPaymentFromDB();
    const userPayment = sumPayment(result);
    const response = generateResponseFromPaymentSum(userPayment);
    const { email, user_id } = job.data;
    console.log(`User ${user_id} with email ${email} `);
    console.log("Reponse:", response);
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD,
    },
  }
);

worker.on("completed", (job) => {
  job.remove();
  console.log("Job completed", job.id);
});

worker.on("error", (err) => {
  console.error(err);
});
