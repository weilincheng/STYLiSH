const express = require("express");
const router = express.Router();
const db = require("../model/db.js");
const queryPromise = db.queryPromise;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const expirationTime = 3600;
const secret = "secret";
const axios = require("axios").default;
const defaultRole = "user";

const generateToken = (id, provider, name, email, picture, role) => {
  return jwt.sign({ id, provider, name, email, picture, role }, secret, {
    expiresIn: expirationTime,
  });
};

// check if password is correct
async function checkPassword(req, res, userEmail, userPassword) {
  // Get password from database
  let sql = `SELECT id, provider, name, email, picture, password, role 
                FROM user 
                WHERE email=${db.escape(userEmail)}`;
  let password, id, provider, name, email, picture, role;
  try {
    const result = await queryPromise(sql);
    if (result.length === 0) {
      res.status(403).json({ status: "email does not match" });
      return;
    }
    ({ password, id, provider, name, email, picture, role } = result[0]);
  } catch {
    res.status(500).json({ error: "Server Error" });
    return;
  }
  const match = await bcrypt.compare(userPassword, password);
  if (match) {
    // Generate token. Default role is "user"
    const access_token = generateToken(
      id,
      provider,
      name,
      email,
      picture,
      role
    );
    const responseData = {
      data: {
        access_token,
        access_expired: expirationTime,
        user: { id, provider, name, email, picture, role },
      },
    };
    res.status(200).json(responseData);
  } else {
    res.status(403).json({ status: "password does not match" });
    return;
  }
}

async function checkFBToken(req, res) {
  let user;
  try {
    user = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${req.body.access_token}`
    );
  } catch {
    res.status(403).json({ status: "invalid token" });
    return;
  }
  // console.log(user.data);
  const userEmail = user.data.email;
  const name = user.data.name;
  const picture = user.data.picture.data.url;
  // Check if email exists, if not, add user to database
  // If email exists, check if password is correct
  async function addUser() {
    let sql = `SELECT id, name as dbUserName, email, role 
                        FROM user 
                        WHERE email=${db.escape(userEmail)}`;
    const result = await queryPromise(sql);
    const access_expired = expirationTime,
      provider = "facebook";

    let responseData, id, dbUserName, email, role;
    if (result.length === 0) {
      // Insert the user data into database
      console.log("Add user to database");
      let sql = `INSERT INTO user 
                            (provider, name, email, picture) VALUES 
                            (${db.escape(provider)}, ${db.escape(name)}, 
                            ${db.escape(userEmail)}, 
                            ${db.escape(picture)})`;
      const result = await queryPromise(sql);
      id = result.insertId;
      // Generate token
      const access_token = generateToken(
        id,
        provider,
        name,
        userEmail,
        picture,
        defaultRole
      );
      responseData = {
        data: {
          access_token,
          access_expired,
          user: {
            id,
            provider,
            name,
            email: userEmail,
            picture,
            defaultRole,
          },
        },
      };
    } else {
      ({ id, dbUserName, email, role } = result[0]);
      // Generate token
      const access_token = generateToken(
        id,
        provider,
        dbUserName,
        email,
        picture,
        role
      );
      console.log("Found user in database");
      responseData = {
        data: {
          access_token,
          access_expired,
          user: {
            id,
            provider,
            name: dbUserName,
            email,
            picture,
            role,
          },
        },
      };
    }
    res.status(200).json(responseData);
  }
  addUser();
}

// User Sign Up Route
router.post("/signup", async (req, res) => {
  // Check if req body has all the required fields and content-type is json
  if (
    !req.is("application/json") ||
    !req.body.name ||
    !req.body.password ||
    !req.body.email
  ) {
    res.status(400).json({ error: "Invalid Json Content" });
    return;
  }
  const { name, password, email } = req.body;
  async function addUser(name, password, email) {
    // Generate hash of password
    const hash = await bcrypt.hash(password, saltRounds);

    // Add user to database
    const access_expired = expirationTime,
      provider = "native",
      picture =
        "https://fettblog.eu/wp-content/uploads/2020/node-modules-meme.png";

    // Generate token
    const access_token = generateToken(
      id,
      provider,
      name,
      email,
      picture,
      defaultRole
    );

    let sql = `INSERT INTO user 
            (provider, name, password, email, picture) 
            VALUES 
            (${db.escape(provider)}, ${db.escape(name)}, 
            ${db.escape(hash)}, ${db.escape(email)}, 
            ${db.escape(picture)})`;
    let id;
    try {
      const result = await queryPromise(sql);
      id = result.insertId;
    } catch {
      // console.log("Error!");
      res.status(403).json({ status: "email exists" });
      return;
    }
    let responseData = {
      data: {
        access_token,
        access_expired,
        user: { id, provider, name, email, picture, defaultRole },
      },
    };
    res.status(200).json(responseData);
  }
  try {
    addUser(name, password, email);
  } catch {
    res.status(500).json({ error: "Server Error" });
  }
});

// User Sign In Route
router.post("/signin", async (req, res) => {
  // Check if req body has all the required fields and content-type is json
  if (!req.is("application/json") || !req.body.provider) {
    res.status(400).json({ error: "Invalid Json Content" });
    return;
  }
  if (req.body.provider === "native") {
    if (!req.body.email || !req.body.password) {
      res.status(400).json({ error: "Invalid Json Content" });
      return;
    }

    const userEmail = req.body.email,
      userPassword = req.body.password;
    // console.log("Run checkPassword");
    try {
      checkPassword(req, res, userEmail, userPassword);
    } catch {
      res.status(500).json({ error: "Server Error" });
    }
  } else if (req.body.provider === "facebook") {
    if (!req.body.access_token) {
      res.status(400).json({ error: "Invalid Json Content" });
      return;
    }

    try {
      checkFBToken(req, res);
    } catch (error) {
      if (error.response) {
        console.log(error.response);
      } else if (error.request) {
        console.log(error.request);
      } else if (error.message) {
        console.log(error.message);
      }
      res.status(500).json({ error: "Server Error" });
    }
  }
});

// User Profile Route
router.get("/profile", async (req, res) => {
  try {
    if (!req.headers.authorization) {
      res.status(401).json({ error: "No token!" });
      return;
    }
    const token = req.headers.authorization.split(" ")[1];
    try {
      const result = jwt.verify(token, secret);
      // console.log(result);
      const { provider, name, email, picture, role } = result;
      const responseData = {
        data: {
          provider,
          name,
          email,
          picture,
          role,
        },
      };
      res.status(200).json(responseData);
      return;
    } catch {
      res.status(403).json({ error: "Invalid token!" });
      return;
    }
  } catch {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
