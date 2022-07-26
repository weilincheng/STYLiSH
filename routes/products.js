const express = require("express");
const router = express.Router();
const db = require("../model/db.js");
const queryPromise = db.queryPromise;

// Category, Search, Details Routes
router.get(
  "/:category(all|men|women|accessories|search|details)",
  async (req, res) => {
    const { category } = req.params;
    let paging = 0,
      keyword;
    if (req.query.paging !== undefined) {
      if (isNaN(parseInt(req.query.paging))) {
        res.status(400).json({
          status: "Paging is not a valid number",
        });
        return;
      } else {
        paging = parseInt(req.query.paging);
      }
    }
    if (category === "search") {
      if (req.query.keyword !== undefined) {
        keyword = "%" + req.query.keyword + "%";
      } else {
        res.status(400).json({
          status: "Keyword is required",
        });
        return;
      }
    }
    let detailId;
    if (req.query.id !== undefined) {
      if (isNaN(parseInt(req.query.id))) {
        res.status(400).json({
          status: "id is not a valid number",
        });
        return;
      } else {
        detailId = parseInt(req.query.id);
      }
    }
    try {
      // Get products from paging * 6 to paging * 6 + 6
      let sql;
      if (category === "all") {
        sql = `SELECT * FROM product LIMIT ${paging * 6}, 6`;
      } else if (category === "search") {
        sql = `SELECT * FROM product WHERE title LIKE '${keyword}' LIMIT ${
          paging * 6
        }, 6`;
      } else if (category === "details") {
        if (detailId === undefined) {
          res.status(400).json({
            status: "id is required",
          });
          return;
        }
        sql = `SELECT * FROM product WHERE id = '${detailId}'`;
      } else {
        sql = `SELECT * FROM product WHERE category = '${category}' LIMIT ${
          paging * 6
        }, 6`;
      }

      // Get products count from category to decide pagination
      const products = await queryPromise(sql);
      if (category === "all") {
        sql = `SELECT COUNT(*) AS count FROM product`;
      } else if (category === "search") {
        sql = `SELECT COUNT(*) AS count FROM product WHERE title LIKE '${keyword}'`;
      } else if (category === "details") {
        sql = `SELECT COUNT(*) AS count FROM product WHERE id = '${detailId}'`;
      } else {
        sql = `SELECT COUNT(*) AS count FROM product WHERE category = '${category}'`;
      }
      const categoryCount = await queryPromise(sql);
      if (categoryCount[0].count === 0) {
        res.status(400).json({ status: "No product found" });
        return;
      }
      // console.log(categoryCount[0].count);
      let productResponse = {};
      // details route does not need an array
      if (category !== "details") {
        productResponse.data = [];
      }

      if (categoryCount[0].count >= (paging + 1) * 6) {
        productResponse.next_paging = paging + 1;
      }

      // Get corresponding images, sizes, variants and colors
      for (let product of products) {
        // Get colors
        sql = `SELECT code, name FROM color WHERE product_id = '${product.id}'`;
        const colors = await queryPromise(sql);
        const colorsArr = [];
        for (let color of colors) {
          colorsArr.push({ code: color.code, name: color.name });
        }

        // Get sizes
        sql = `SELECT size FROM size WHERE product_id = '${product.id}'`;
        const sizes = await queryPromise(sql);
        const sizeArr = [];
        for (let size of sizes) {
          sizeArr.push(size.size);
        }

        // Get variant
        sql = `SELECT color_code, size, stock FROM variant WHERE product_id = '${product.id}'`;
        const variants = await queryPromise(sql);
        const variantsArr = [];
        for (let variant of variants) {
          variantsArr.push({
            color_code: variant.color_code,
            size: variant.size,
            stock: variant.stock,
          });
        }

        // Get images
        sql = `SELECT image FROM image WHERE product_id = '${product.id}'`;
        const images = await queryPromise(sql);
        const imagesPath = [];
        for (let image of images) {
          const imagePath = process.env.IMAGEPATH + image.image;
          imagesPath.push(imagePath);
        }

        // Add image path to main image
        const mainImagePath = process.env.IMAGEPATH + product.main_image;

        // Details route does not need an array
        if (category !== "details") {
          productResponse.data.push({
            id: product.id,
            category: product.category,
            title: product.title,
            description: product.description,
            price: product.price,
            texture: product.texture,
            wash: product.wash,
            place: product.place,
            note: product.note,
            story: product.story,
            colors: colorsArr,
            sizes: sizeArr,
            variants: variantsArr,
            main_image: mainImagePath,
            images: imagesPath,
          });
        } else {
          productResponse.data = {
            id: product.id,
            category: product.category,
            title: product.title,
            description: product.description,
            price: product.price,
            texture: product.texture,
            wash: product.wash,
            place: product.place,
            note: product.note,
            story: product.story,
            colors: colorsArr,
            sizes: sizeArr,
            variants: variantsArr,
            main_image: mainImagePath,
            images: imagesPath,
          };
        }
      }

      // console.log(productResponse);
      if (productResponse.data.length === 0) {
        res.status(400).json({ status: "No product found" });
      } else {
        res.status(200).json(productResponse);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: "Internal server error" });
    }
  }
);

module.exports = router;
