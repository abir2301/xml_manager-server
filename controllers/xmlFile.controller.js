const { default: mongoose } = require("mongoose");
const { XmlElement } = require("../models/element.model");
const { FileSchema } = require("../models/fileSchema.model");
const { File } = require("../models/file.model");
const {
  getAllFiles,
  createCopies,
  getSchemaById,
  getFileByID,
} = require("../utilities/schema.services");
require("dotenv").config();
const { create } = require("xmlbuilder2");
const fs = require("fs");
const xmlbuilder = require("xmlbuilder");
const { isValidObjectId, Types } = require("mongoose");
const { createGunzip } = require("zlib");

exports.getFile = async (req, res) => {
  return res.send({
    succes: true,
    message: "get file by id",
    data: await getSchemaById(req.params.id),
  });
};
exports.create = async (req, res) => {
  try {
    const schema = await FileSchema.findById(req.params.id);
    if (!schema) {
      return res
        .status(409)
        .json({ succes: false, message: "file  Already exists " });
    } else {
      const file = await FileSchema.create({
        title: req.body.title,
        isFile: true,
        user: req.userId,
      });

      const composition = await getSchemaById(schema._id);
      const schemaRoot = composition.data[0];
      const root = await XmlElement.create({
        name: schemaRoot.name,
        type: schemaRoot.type,
        parent_id: null,
        schema_id: file._id,
        is_attribute: false,
      });

      await createCopies(root._id, composition.data[0].childrens, file._id);

      const fileComp = await getSchemaById(file._id);
      return res.status(200).send({
        success: true,
        message: "file is creates succesfully",
        data: fileComp,
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
    const { title } = req.body;
    const file = await FileSchema.findByIdAndUpdate(req.params.id, {
      title,
    });

    file.save();

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "file not found" });
    }

    return res
      .json({
        success: true,
        message: "file is updated successfully ",
        data: await getAllFiles(req.userId),
      })
      .status(200);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.delete = async (req, res) => {
  try {
    const file = await FileSchema.findByIdAndDelete(req.params.id);
    console.log("file");

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "file not found" });
    }
    return res
      .send({
        success: true,
        message: "file is Deleted successfully ",
        data: await getAllFiles(req.userId),
      })
      .status(200);
  } catch (error) {
    res.status(500).send({ success: false, message: "Server error" });
  }
};
exports.getAll = async (req, res) => {
  try {
    return res
      .send({
        success: true,
        message: "schemas",
        data: await getAllFiles(req.userId),
      })
      .status(200);
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};
exports.getAllNames = async (req, res) => {
  try {
    return res
      .send({
        success: true,
        message: "schemas",
        data: (await getAllFiles(req.userId)).length,
      })
      .status(200);
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};
exports.addXmlNode = async (req, res) => {
  const file = await File.findById(req.body.file);
  const node = await XmlElement.findById(req.params.id);
  if (!node) {
    return res
      .status(404)
      .json({ success: false, message: " Node  Not Found" });
  }
  if (!file) {
    return res
      .status(404)
      .json({ success: false, message: " File  Not Found" });
  }
  if (node.type !== "list" && node.type !== "complexe") {
    const composite = {
      id_element: node._id,
      value: req.body.value,
    };
    file.composition.push(composite);
    await file.save();
    return res.status(200).send({
      success: true,
      message: "value is  added   succesfully .",
      data: file,
    });
  }
};

exports.xmlFile = async (req, res) => {
  const file = await getFileByID(req.params.id);

  const root = xmlbuilder.create("xml");

  function addElements(xmlNode, data) {
    data.forEach((item) => {
      const child = xmlNode.ele(item.name);

      // Check if item has attributes and add them
      if (item.attribute && item.attribute._id) {
        child.att(item.attribute.name, item.attribute.value || "");
      }

      // Check if item has a value and add it
      if (item.value !== null) {
        child.txt(item.value);
      }

      // If item has children, recurse
      if (item.childrens.length > 0) {
        addElements(child, item.childrens);
      }
    });
  }
  addElements(root, file.data);

  // Convert the XML to a string
  const xmlString = root.end({ pretty: true });

  // Write the XML content to a file
  const fileName = "xmlFiles/output.xml";
  fs.writeFileSync(fileName, xmlString);

  return res
    .send({ success: true, message: "file uploaded ", data: file })
    .status(200);
};
