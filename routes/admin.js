const express = require("express");
const router = express.Router();
const db = require("../model/db.js");
const queryPromise = db.queryPromise;
const { addImage } = require("../controller/marketing_controller.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const maxFileSize = 200000;
const maxFileCounts = 4;
const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize, files: maxFileCounts },
});
const client = require("../model/redis");
const { authUser } = require("../middleware/auth.js");
const adminPermission = ["admin"];
const Order = require("../controller/order_controller.js");

router.get("/dashboard", async (req, res) => {
  let used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The script uses approximately ${used} MB`);
  const result = await Order.getTotalRevenue();
  result.color_count = await Order.getColorCount();
  result.price_quantity = await Order.getPriceQuantity();
  result.top5Products = await Order.getTop5Products();
  used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The script uses approximately ${used} MB`);
  res.status(200).json(result);
});

router.post("*", authUser(adminPermission));

router.post("/addCampaign", async (req, res) => {
  try {
    await client.del("campaignData");

    const { id, picture, story } = req.body;
    let sql = `INSERT INTO campaign
            (product_id, picture, story)
            VALUES
            (${db.escape(id)}, ${db.escape(picture)}, 
            ${db.escape(story)})`;
    const result = await queryPromise(sql);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
});

router.post("/addCampaignImage", upload.array("image"), async (req, res) => {
  try {
    const files = req.files;
    const result = await addImage(files);
    const fileName = result[0].split("/")[1];
    console.log(`Uploading campaign image ${fileName}`);
    return res.status(200).json({ filename: fileName });
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/addProductMainImage",
  upload.array("main_image"),
  async (req, res) => {
    try {
      const files = req.files;
      const result = await addImage(files);
      const fileName = result[0].split("/")[1];
      console.log(`Uploading main image to ${fileName}`);
      return res.status(200).json({ filename: fileName });
    } catch (err) {
      console.log(err);
    }
  }
);

router.post("/updateProductMainImagePath", async (req, res) => {
  try {
    const { fileName, id } = req.body;
    // console.log(fileName, id);
    let sql = `UPDATE product 
                set main_image = ${db.escape(fileName)}
                WHERE
                id = ${db.escape(id)}`;
    const result = await queryPromise(sql);
    // console.log(result);
    return res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
});

router.post("/addProductImages", upload.array("images"), async (req, res) => {
  try {
    const files = req.files;
    const result = await addImage(files);
    const response = { data: [] };
    for (let i = 0; i < result.length; i++) {
      response.data.push(result[i].split("/")[1]);
    }
    console.log(response.data);
    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
  }
});

router.post("/updateProductImagesPath", async (req, res) => {
  try {
    const { data, id } = req.body;
    // console.log(data, id);
    for (let i = 0; i < data.length; i++) {
      let sql = `INSERT INTO image
                (product_id, image)
                VALUES
                (${db.escape(id)}, ${db.escape(data[i])})`;
      const result = await queryPromise(sql);
      // console.log(result);
    }
    return res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
});

router.post("/addProduct", (req, res) => {
  console.log(req.body);
  try {
    const {
      id,
      category,
      title,
      description,
      price,
      texture,
      wash,
      place,
      note,
      story,
    } = req.body;
    const sql = `INSERT INTO product (id, category, title, description, price, texture, wash, place, note, story) VALUES ('${id}', '${category}', '${title}', '${description}', '${price}', '${texture}', '${wash}', '${place}', '${note}', '${story}')`;
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Successfully sql: ${sql}`);
        res.send(result);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/addColors", (req, res) => {
  console.log(req.body);
  try {
    const { id, colors } = req.body;
    const colorCodeNames = colors.split(",");
    for (let i = 0; i < colorCodeNames.length - 1; i += 2) {
      const sql = `INSERT INTO color (product_id, code, name) VALUES ('${id}', '${
        colorCodeNames[i]
      }', '${colorCodeNames[i + 1]}')`;
      db.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Successfully sql: ${sql}`);
        }
      });
    }
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});

router.post("/addSizes", (req, res) => {
  console.log(req.body);
  try {
    const { id, sizes } = req.body;
    const sizeNames = sizes.split(",");
    for (let i = 0; i < sizeNames.length; i++) {
      const sql = `INSERT INTO size (product_id, size) VALUES ('${id}', '${sizeNames[i]}')`;
      db.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Successfully sql: ${sql}`);
        }
      });
    }
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});

router.post("/addVariants", (req, res) => {
  console.log(req.body);
  try {
    const { id, variants } = req.body;
    const codeSizeStock = variants.split(",");
    for (let i = 0; i < codeSizeStock.length - 2; i += 3) {
      const sql = `INSERT INTO variant (product_id, color_code, size, stock) VALUES ('${id}', '${
        codeSizeStock[i]
      }', '${codeSizeStock[i + 1]}', '${codeSizeStock[i + 2]}')`;
      db.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Successfully sql: ${sql}`);
        }
      });
    }
    res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
