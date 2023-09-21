const { default: mongoose } = require("mongoose");
const { XmlElement } = require("../models/element.model");
const { FileSchema } = require("../models/fileSchema.model");

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
const getAllSchemas = async (user) => {
  const schemas = await FileSchema.find({ user: user });
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
  return list;
};

const getSchemaById = async (id) => {
  const schema = await FileSchema.findOne({ _id: id });
  if (!schema) {
    return null;
  }
  const root = await XmlElement.findOne({
    schema_id: schema._id,
    parent_id: null,
  });
  if (!root) {
    res
      .status(404)
      .send({ success: false, message: "schema root  not found." });
  }
  const composition = await getSchemaElementsRecursive(root._id);
  return {
    _id: schema._id,
    title: schema.title,
    version: schema.version,
    data: [composition],
  };
};
module.exports = {
  getAllSchemas,
  getSchemaById,
};
