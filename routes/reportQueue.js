require("dotenv").config();
const express = require("express");
const router = express.Router();
const { Queue } = require("bullmq");
const permission = ["user", "admin"];
const { authUser } = require("../middleware/auth.js");

const createQueue = (queueName) => {
  const myQueue = new Queue(queueName, {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD,
    },
  });
  return myQueue;
};

const addJob = async (queue, jobName, payload) => {
  await queue.add(jobName, payload);
};

router.get("*", authUser(permission));

router.get("/payments", async (req, res) => {
  const userId = req.body.user_id;
  const email = req.body.email;

  // Create a new connection in every instance
  const queue = createQueue("payments");

  // Add a job to the queue
  addJob(queue, "payments", { user_id: userId, email: email });

  return res.json({ userId, email, message: "Your job submitted successful" });
});

module.exports = router;
