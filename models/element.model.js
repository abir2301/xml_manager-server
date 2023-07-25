const mongoose = require("mongoose");
const joi = require("joi");

const elementSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    // required: true,
    default: null,
  },
  value: {
    type: String,
    default: null,
  },
  lavelH: {
    type: Number,
  },
  attribute_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "XmlElement",
    required: false,
    default: null,
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "XmlElement",
    required: false,
  },
  childrens: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "XmlElement",
    required: false,
  },
});
function xmlElementValidation(element) {
  const schema = joi.object({
    name: joi.string().required(),
    value: joi.string(),
    type: joi.string(),
    lavelH: joi.number(),
  });

  return schema.validate(element);
}

const XmlElement = mongoose.model("Elements", elementSchema);
exports.XmlElement = XmlElement;
exports.xmlElementValidation = xmlElementValidation;
