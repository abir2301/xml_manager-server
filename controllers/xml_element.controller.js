const { default: mongoose } = require("mongoose");
const { XmlElement } = require("../models/element.model");
const { FileSchema } = require("../models/fileSchema.model");
const {
  getAllSchemas,
  getSchemaById,
} = require("../utilities/schema.services");
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

    const siblings = await XmlElement.find({
      parent_id: parent._id,
    }).sort({ lavelH: 1 });

    if (req.body.is_attribute) {
      const bool = await hasAttributeFn(parent._id, schema._id, null);
      console.log("boooool" + bool);
      if (bool) {
        return res
          .status(400)
          .json({ success: false, message: "Already Have An Attribute" });
      }
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

    if (element.lavelH <= siblingWithMaxLavelH.lavelH) {
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
      data: await getSchemaById(schema._id),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: "some error occure while creating new Element .",
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
    const query = await XmlElement.findById(req.params.id);
    const itHasAttribute = await checkIfHasAttributeFn(
      query.parent_id,
      query.schema_id,
      req.params.id
    );
    console.log("hasAtribute  " + itHasAttribute);
    if (is_attribute && itHasAttribute) {
      return res
        .status(400)
        .json({ success: false, message: "Already Have An Attribute" });
    }
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

    res.json({
      success: true,
      message: "element is  updated  succesfully .",
      data: await getSchemaById(element.schema_id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

const deleteElement = async (elementId) => {
  try {
    const element = await XmlElement.findById(elementId);
    if (!element) {
      return; // Element not found, exit recursion
    }

    const children = await XmlElement.find({ parent_id: element._id });

    // Recursively delete children
    for (const child of children) {
      await deleteElement(child._id);
    }

    // Delete the current element
    await XmlElement.findByIdAndDelete(elementId);
  } catch (error) {
    // Handle any errors here
    console.error(`Error deleting element: ${error}`);
  }
};
exports.delete = async (req, res) => {
  try {
    const elementId = req.params.id;
    const element = await XmlElement.findById(req.params.id);
    await deleteElement(elementId);
    res.json({
      success: true,
      message: "Element is deleted successfully",
      data: await getSchemaById(element.schema_id),
    });
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

  for (const element of subElements) {
    const child = await getChildrensRecursive(element._id);
    if (child) {
      childrens.push(child);
    }
  }

  return { ...element.toObject(), childrens };
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

const hasAttributeFn = async (parent_id, schema_id) => {
  const hasAttribute = await XmlElement.find({
    is_attribute: 1,
    parent_id: parent_id,
    schema_id: schema_id,
  });
  console.log(hasAttribute);
  if (hasAttribute.length >= 1) {
    return true;
  }
  return false;
};

const checkIfHasAttributeFn = async (parent_id, schema_id, _id) => {
  const hasAttribute = await XmlElement.findOne({
    is_attribute: 1,
    parent_id: parent_id,
    schema_id: schema_id,
    _id: { $ne: _id },
  });
  console.log(hasAttribute);
  if (hasAttribute) {
    return true;
  }
  return false;
};
