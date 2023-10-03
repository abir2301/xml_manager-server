const mongoose = require("mongoose");
const User = require("./user.model");
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isFile: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const FileSchema = mongoose.model("fileSchemas", schema);
exports.FileSchema = FileSchema;
