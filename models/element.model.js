const mongoose = require("mongoose");
const joi = require("joi");
const FileSchemas = require("./fileSchema.model");

const elementSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
    default: null,
  },

  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "XmlElement",
    required: false,
  },

  schema_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FileSchemas",
    required: false,
  },
  is_attribute: {
    type: Boolean,
    default: false,
    required: false,
  },
  lavelH: {
    type: Number,
    required: false,
    default: 1,
  },
});
function xmlElementValidation(element) {
  const schema = joi.object({
    name: joi.string().required(),
    type: joi.string().required(),
  });

  return schema.validate(element);
}

const XmlElement = mongoose.model("elements", elementSchema);
exports.XmlElement = XmlElement;
exports.xmlElementValidation = xmlElementValidation;
