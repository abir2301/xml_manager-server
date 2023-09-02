const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const XmlElement = require("./routes/xml_element.router");
const FileSchema = require("./routes/file_schema.router");
const app = new express();
require("dotenv").config();
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send(" heyy app ");
});
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Replace with your frontend's URL
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.listen(3002, () => {
  console.log("app run on port 3002");
});
//`${process.env.API}/${process.env.XML_ELEMENT}`  not found
app.use("/api/xml_element", XmlElement);
app.use("/api/file_schema", FileSchema);
mongoose
  .connect("mongodb://127.0.0.1:27017/xml_manager")
  .then(() => {
    console.log("db connected ");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error);
  });
