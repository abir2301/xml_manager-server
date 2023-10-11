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
  let attribute = {};
  for (const element of subElements) {
    if (element.is_attribute !== true) {
      const child = await getSchemaElementsRecursive(element._id);
      if (child != null) {
        childrens.push(child);
      }
    } else {
      attribute = element;
    }
  }
  return { ...element.toObject(), childrens, attribute };
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
const getSchemaAttribute = async (schema) => {
  const file = await FileSchema.findOne({ _id: schema._id });
  if (file) {
  }
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
const getAllFiles = async (user) => {
  const schemas = await FileSchema.find({ user: user, isFile: true });
  const list = [];
  for (i = 0; i < schemas.length; i++) {
    const schema = schemas[i];
    const obj = await getFileByID(schema._id);
    // const content = await getSchemaComposition(schema);

    // const obj = {
    //   _id: schema._id,
    //   title: schema.title,
    //   isFile: schema.isFile,
    //   version: schema.version,
    //   data: [content.composition],
    // };

    list.push(obj);
  }
  return list;
};

const getFileByID = async (id) => {
  const schema = await FileSchema.findById(id);
  if (schema) {
    const content = await getSchemaComposition(schema);

    const obj = {
      _id: schema._id,
      title: schema.title,
      isFile: schema.isFile,
      version: schema.version,
      data: [content.composition],
    };

    return obj;
  } else return {};
};

const getSchemaById = async (id) => {
  console.log("get schema composition ");
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
const createCopies = async (id_parent, childrens, file_id) => {
  // console.log("create coppies ");
  // console.log(childrens);
  if (childrens.length == 0) return null;
  childrens.map(async (child) => {
    try {
      const node = await XmlElement.create({
        name: child.name,
        type: child.type,
        parent_id: id_parent,
        schema_id: file_id,
        is_attribute: child.is_attribute,
        lavelH: child.lavelH,
        value: null,
      });
      if (child.childrens.length >= 1) {
        createCopies(node.id, child.childrens, file_id);
      }
    } catch (error) {
      console.log(error);
    }
  });
  return null;
};

module.exports = {
  getAllSchemas,
  getSchemaById,
  createCopies,
  getAllFiles,
  getFileByID,
};
