const express = require("express");
const router = express.Router();
const db = require("../model/db.js");
const queryPromise = db.queryPromise;
const client = require("../model/redis");

// Get campaign route
router.get("/campaigns", async (req, res) => {
  try {
    // Check if redis has campaign data
    // await client.connect();
    if (await client.get("campaignData")) {
      console.log("Found campaign data in redis");
      const value = await client.get("campaignData");
      const result = await JSON.parse(value);
      // client.quit();
      const campaignData = { data: result };
      return res.status(200).json(campaignData);
    } else {
      console.log("No campaign data in redis");
      let sql = `SELECT product_id, picture, story FROM campaign`;
      const result = await queryPromise(sql);
      if (result.length === 0) {
        return res.status(200).json({
          status: "No campaign found",
        });
      }

      for (let i = 0; i < result.length; i++) {
        result[i].picture = `${process.env.IMAGEPATH}${result[i].picture}`;
      }
      const campaignData = { data: result };
      await client.set("campaignData", JSON.stringify(result));
      // client.quit();
      return res.status(200).json(campaignData);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
