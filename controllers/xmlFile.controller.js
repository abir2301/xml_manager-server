const { default: mongoose } = require("mongoose");
const { XmlElement } = require("../models/element.model");
const { FileSchema } = require("../models/fileSchema.model");
const { File } = require("../models/file.model");
const {
  getAllSchemas,
  getSchemaById,
} = require("../utilities/schema.services");
require("dotenv").config();
const { create } = require("xmlbuilder2");
const fs = require("fs");
const { isValidObjectId, Types } = require("mongoose");

exports.create = async (req, res) => {
  try {
    const schema = await FileSchema.findById(req.params.id);
    if (!schema) {
      return res
        .status(409)
        .json({ succes: false, message: "file  Already exists " });
    } else {
      const file = await File.create({
        name: req.body.name,
        schema: schema._id,
      });
      return res.status(200).send({
        succes: true,
        message: "file is creates succesfully",
        data: file,
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error,
    });
  }
};
exports.update = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid ID format." });
    }
    const { name } = req.body;
    const file = await File.findByIdAndUpdate(req.params.id, {
      name,
    });

    file.save();

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "file not found" });
    }

    return res.json({
      success: true,
      message: "file is updated successfully ",
      data: file,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.delete = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "file not found" });
    }

    return res.json({
      success: true,
      message: "file is Deleted successfully ",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getAll = async (req, res) => {
  try {
    const files = await File.find();

    res.json({ success: true, message: "files ", data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
