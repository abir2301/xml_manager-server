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
    required: true,
  },

  composition: {
    type: [
      {
        id_element: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "XmlElement", // Refer to the XmlElement model
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

const File = mongoose.model("files", schema);
exports.File = File;
