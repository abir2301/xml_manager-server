const { default: mongoose } = require("mongoose");
const { XmlElement } = require("../models/element.model");
const { FileSchema } = require("../models/fileSchema.model");
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
    const exist = await FileSchema.findOne({ title: req.body.title });
    if (exist) {
      return res.status(409).send({
        success: false,
        message: "Already exist a schema with the same name .",
        data: exist,
      });
    }
    const schema = await FileSchema.create({ title: req.body.title });

    const root = await XmlElement.create({
      name: "root",
      type: "root",
      is_attribute: false,
      schema_id: schema._id,
      parent_id: null,
      lavelH: 0,
    });
    if (root)
      return res.status(200).send({
        success: true,
        message: "schema  is  created  succesfully .",
        data: schema,
      });
  } catch (error) {
    return res.status(500).send({
      success: false,
      error: error,
    });
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

  for (const element of subElements) {
    const child = await getSchemaElementsRecursive(element._id);
    if (child != null) {
      childrens.push(child);
    }
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

    res.json({
      success: true,
      message: "schema is updated successfully ",
      data: schema,
    });
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

    res.json({ success: true, message: "schema is Deleted successfully " });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.SchemaFile = async (req, res) => {
  // Create an XML builder
  const schema = await getSchemaById(req.params.id);
  const xml = create();

  // Define the XML schema structure
  const xsd = xml.ele("xs:schema", {
    xmlns: "http://www.w3.org/2001/XMLSchema",
  });

  function convertToXML(parentElement, data) {
    for (const item of data) {
      const element = parentElement.ele("xs:element", { name: item.name });
      if (item.childrens.length == 0) {
        element.att("type", item.type);
      }
      // Handle attributes if needed
      if (item.is_attribute) {
        const attribute = parentElement.ele("xs:attribute", {
          name: item.name,
        });
        attribute.att("type", item.type);
      } else {
        if (item.childrens.length >= 1) {
          const complexType = element.ele("xs:complexType");
          const sequence = complexType.ele("xs:sequence");

          // Recursively add child elements
          if (item.childrens && item.childrens.length > 0) {
            convertToXML(sequence, item.childrens);
          }
        }
      }
    }
  }

  convertToXML(xsd, schema.data);

  // Convert the XML builder to a string
  const xsdString = xml.end({ prettyPrint: true });

  const filePath = `xsdFiles/schema.xsd`;
  fs.writeFileSync(filePath, xsdString, "utf-8");
  return res.send({ success: true, message: "file uploaded " });
};
