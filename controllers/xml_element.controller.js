const { default: mongoose } = require("mongoose");
const { FileSchema } = require("../models/fileSchema.model");
const { XmlElement, xmlElementValidation } = require("../models/element.model");
require("dotenv").config();
const joi = require("joi");
const { isValidObjectId, Types } = require("mongoose");

exports.create = async (req, res) => {
  try {
    const schema = await FileSchema.findOne({ _id: req.body.schema });
    if (!schema) {
      return res
        .status(404)
        .json({ success: false, message: " Schema Not Found" });
    }
    const parent = await XmlElement.findOne({ _id: req.params.id });
    if (!parent) {
      return res
        .status(404)
        .json({ success: false, message: " Parent Element not found" });
    }
    const element = await XmlElement.create({
      name: req.body.name,
      type: req.body.type,
      is_attribute: req.body.is_attribute,
      schema_id: schema._id,
      parent_id: parent._id,
      lavelH: req.body.lavelH,
    });
    const siblingWithMaxLavelH = await XmlElement.find({
      parent_id: parent._id,
    })
      .sort({ lavelH: -1 })
      .limit(1);
    const siblings = await XmlElement.find({
      parent_id: parent._id,
    }).sort({ lavelH: 1 });
    if (element.lavelH < siblingWithMaxLavelH.lavelH) {
      siblings.forEach(async (element1) => {
        if (element1.lavelH > element.lavelH) {
          element1.lavelH = element.lavelH + 1;
          await element1.save();
        }
      });
    }
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
exports.createRoot = async (req, res) => {
  //input validation
  const { error } = xmlElementValidation(req.body);
  if (error) {
    return error.details[0].message;
  }

  try {
    const schema = await FileSchema.findOne({ _id: req.params.id });
    console.log(schema);
    if (!schema) {
      return res
        .status(404)
        .json({ success: false, message: " Schema Not Found" });
    }
    const root = await XmlElement.findOne({ parent_id: null });
    if (root) {
      return res
        .status(404)
        .json({ success: false, message: " root Element is already Exist" });
    }

    const element = await XmlElement.create({
      name: req.body.name,
      type: req.body.type,
      is_attribute: false,
      schema_id: schema._id,
      parent_id: null,
      lavelH: 0,
    });
    res.status(200).send({
      success: true,
      message: " Root Element is  Created  Succesfully .",
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
    const { name, type, is_attribute, lavelH } = req.body;
    const element = await XmlElement.findByIdAndUpdate(req.params.id, {
      name,
      type,
      lavelH,
      is_attribute,
      lavelH,
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

const getChildrensRecursive = async (elementId) => {
  const element = await XmlElement.findOne({ _id: elementId });
  if (!element) {
    return null;
  }

  const childrens = [];
  const subElements = await XmlElement.find({
    parent_id: elementId,
  }).sort({ lavelH: 1 });

  const attribute = await XmlElement.findOne({
    parent_id: elementId,
    is_attribute: 1,
  });
  for (const element of subElements) {
    const child = await getChildrensRecursive(element._id);
    if (child) {
      childrens.push(child);
    }
  }

  return { ...element.toObject(), childrens, attribute };
};
exports.subElements = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .send({ success: false, message: "Invalid ID format." });
  }
  const parent = await XmlElement.findOne({ _id: req.params.id });
  if (parent) {
    const childrens = await getChildrensRecursive(parent._id);
    console.log(childrens);
    res.send({
      success: true,
      data: childrens,
    });
  } else {
    res.status(404).send({ success: false, message: "Parent not found." });
  }
};
