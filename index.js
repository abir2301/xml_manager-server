const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const XmlElement = require("./routes/xml_element.router");
const app = new express();
require("dotenv").config();
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send(" heyy app ");
});
app.listen(3001, () => {
  console.log("app run on port 3001");
});
//`${process.env.API}/${process.env.XML_ELEMENT}`  not found
app.use("/api/xml_element", XmlElement);
mongoose
  .connect("mongodb://127.0.0.1:27017/xml_manager")
  .then(() => {
    console.log("db connected ");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error);
  });
