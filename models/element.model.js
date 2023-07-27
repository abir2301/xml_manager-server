const mongoose = require("mongoose");
const joi = require("joi");

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

  // attribute_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "XmlElement",
  //   required: false,
  //   default: null,
  // },
  // parent_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "XmlElement",
  //   required: false,
  // },
  // childrens: {
  //   type: [mongoose.Schema.Types.ObjectId],
  //   ref: "XmlElement",
  //   required: false,
  // },
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
