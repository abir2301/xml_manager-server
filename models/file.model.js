const mongoose = require("mongoose");
const joi = require("joi");
const { FileSchema } = require("./fileSchema.model");
const { XmlElement } = require("./element.model");

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  schema: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FileSchema",
    required: false,
  },
});

const File = mongoose.model("files", schema);
exports.File = File;
