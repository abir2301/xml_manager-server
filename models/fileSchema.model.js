const mongoose = require("mongoose");
const joi = require("joi");
const { XmlElement } = require("./element.model");
const schema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  },
});

const FileSchema = mongoose.model("fileSchemas", schema);
exports.FileSchema = FileSchema;
