require("dotenv").config();
const express = require("express");
const app = express();
const products = require("./routes/products");
const user = require("./routes/user");
const marketing = require("./routes/marketing");
const admin = require("./routes/admin");
const order = require("./routes/order");
const report = require("./routes/report");
const reportQueue = require("./routes/reportQueue.js");
const port = process.env.PORT || 8080;
const {
  rateLimiter,
  rateLimiterSortedList,
} = require("./middleware/rateLimiter.js");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const compression = require("compression");

app.use(express.json());
app.set("trust proxy", true);
app.set("json spaces", 2);
app.set("socketio", io);
app.use(compression());

// Home Route
app.get("/", (req, res) => {
  res.redirect("index.html");
});

// Serve the static file under admin panel
app.use(express.static("public"));

// app.use(rateLimiter());
app.use(rateLimiterSortedList());

// Product route
app.use("/api/1.0/products", products);

// User route
app.use("/api/1.0/user", user);

// Marketing route
app.use("/api/1.0/marketing", marketing);

// Order route
app.use("/api/1.0/order", order);

// Report route
app.use("/api/1.0/report", report);
app.use("/api/2.0/report", reportQueue);

// Admin api route
app.use("/admin/api/1.0", admin);

app.use((err, req, res, next) => {
  res.status(500).send("Something broke!");
});

// Start Server
server.listen(port, () => {
  console.log(
    `Example app listening on port ${port} => http://localhost:${port}`
  );
});

module.exports = { server };
