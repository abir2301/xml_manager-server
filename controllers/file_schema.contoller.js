const { default: mongoose } = require("mongoose");
const { XmlElement } = require("../models/element.model");
const { FileSchema } = require("../models/fileSchema.model");
require("dotenv").config();
const { isValidObjectId, Types } = require("mongoose");

exports.create = async (req, res) => {
  const schema = await FileSchema.findOne({ title: req.body.title });
  if (schema) {
    res
      .send({
        success: true,
        message: "schema already is exist .",
        data: schema,
      })
      .status(409);
  } else {
    const schemaX = await FileSchema.create({ title: req.body.title });
    res
      .send({
        success: true,
        message: "schema  is  created  succesfully .",
        data: schemaX,
      })
      .status(200);
  }
};
exports.getAll = async (req, res) => {
  const schemas = await FileSchema.find();
  res
    .send({
      success: true,
      message: "schemas",
      data: schemas,
    })
    .status(200);
};
exports.getOne = async (req, res) => {};
exports.update = async (req, res) => {};
exports.delete = async (req, res) => {};
