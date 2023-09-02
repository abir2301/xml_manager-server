const { default: mongoose } = require("mongoose");
const { XmlElement } = require("../models/element.model");
const { FileSchema } = require("../models/fileSchema.model");
require("dotenv").config();
const { create } = require("xmlbuilder2");

const fs = require("fs");
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
const getSchemaComposition = async (param) => {
  const schema = await FileSchema.findOne({ _id: param._id });
  if (!schema) {
    return {};
  }
  const root = await XmlElement.findOne({
    schema_id: schema._id,
    parent_id: null,
  });
  if (!root) {
    return {};
  }
  const composition = await getSchemaElementsRecursive(root._id);
  let data = JSON.stringify(composition);
  // const xmlData = convertToXml(composition);
  return { composition };
};
exports.getAll = async (req, res) => {
  const schemas = await FileSchema.find();
  const list = [];
  for (i = 0; i < schemas.length; i++) {
    const schema = schemas[i];
    const content = await getSchemaComposition(schema);
    const obj = {
      _id: schema._id,
      title: schema.title,
      version: schema.version,
      data: [content.composition],
    };

    list.push(obj);
  }

  res
    .send({
      success: true,
      message: "schemas",
      data: list,
    })
    .status(200);
};
const getSchemaElementsRecursive = async (elementId) => {
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
    const child = await getSchemaElementsRecursive(element._id);
    if (child != null) {
      childrens.push(child);
    }
  }
  if (attribute !== null) {
    childrens.push(attribute);
  }

  return { ...element.toObject(), childrens };
};

function convertToXml(jsonData) {
  const root = create({ version: "1.0" }).ele(jsonData.name || "root");

  function buildXmlElement(xmlElement, jsonData) {
    if (jsonData.attribute) {
      xmlElement.att(jsonData.attribute.name, jsonData.attribute.type);
    }

    for (const child of jsonData.childrens) {
      const childElement = xmlElement.ele(child.name);
      buildXmlElement(childElement, child);
    }
  }

  buildXmlElement(root, jsonData);

  return root.end({ prettyPrint: true });
}

exports.getOne = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .send({ success: false, message: "Invalid ID format." });
  }
  const schema = await FileSchema.findOne({ _id: req.params.id });
  if (!schema) {
    res.status(404).send({ success: false, message: "Schema not found." });
  }
  const root = await XmlElement.findOne({
    schema_id: schema._id,
    parent_id: null,
  });
  if (!root) {
    res.status(404).send({ success: false, message: "Schema not found." });
  }
  const composition = await getSchemaElementsRecursive(root._id);
  let data = JSON.stringify(composition);
  // const xmlData = convertToXml(composition);
  // console.log(xmlData);
  res.send({
    success: true,
    data: composition,
  });
};

exports.update = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .send({ success: false, message: "Invalid ID format." });
    }
    const { title } = req.body;
    const schema = await FileSchema.findByIdAndUpdate(req.params.id, {
      title,
    });
    schema.version++;
    schema.save();

    if (!schema) {
      return res
        .status(404)
        .json({ success: false, message: "schema not found" });
    }

    res.json({ success: true, data: schema });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.delete = async (req, res) => {
  try {
    const schema = await FileSchema.findByIdAndDelete(req.params.id);
    if (!schema) {
      return res
        .status(404)
        .json({ success: false, message: "schema not found" });
    }

    res.json({ success: true, message: "schema is Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
