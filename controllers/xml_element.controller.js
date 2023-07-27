const { default: mongoose } = require("mongoose");
const { XmlElement, xmlElementValidation } = require("../models/element.model");
require("dotenv").config();
const joi = require("joi");
const { isValidObjectId, Types } = require("mongoose");

exports.create = async (req, res) => {
  //input validation
  const { error } = xmlElementValidation(req.body);
  if (error) {
    return error.details[0].message;
  }

  try {
    const element = await XmlElement.create({
      name: req.body.name,
      type: req.body.type,
    });
    res.status(200).send({
      success: true,
      message: "element is  created  succesfully .",
      data: element,
    });
  } catch {
    res.status(500).send({
      success: false,
      error: "some error occure while creating new rootElement .",
    });
  }
};

exports.getAll = async (req, res) => {
  const elements = await XmlElement.find();
  res.send({
    success: true,
    message: "Get All Elements .",
    data: elements,
  });
};

exports.update = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid ID format." });
    }
    const { name, type } = req.body;
    const element = await XmlElement.findByIdAndUpdate(req.params.id, {
      name,
      type,
    });

    if (!element) {
      return res
        .status(404)
        .json({ success: false, message: "Element not found" });
    }

    res.json({ success: true, data: element });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const element = await XmlElement.findByIdAndDelete(req.params.id);
    if (!element) {
      return res
        .status(404)
        .json({ success: false, message: "Element not found" });
    }
    res.json({ success: true, message: "Element is Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
