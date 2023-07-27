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

  childrens: {
    type: [
      {
        element: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "XmlElement", // Refer to the XmlElement model
          required: true,
        },
        parent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "XmlElement", // Refer to the XmlElement model
          required: true,
        },
        lavelH: Number,
      },
    ],
  },
});

const FileSchema = mongoose.model("fileSchemas", schema);
exports.FileSchema = FileSchema;
