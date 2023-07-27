const { default: mongoose } = require("mongoose");
const { XmlElement } = require("../models/element.model");
const { FileSchema } = require("../models/fileSchema.model");
require("dotenv").config();
const joi = require("joi");
const { isValidObjectId, Types } = require("mongoose");

exports.create = async (req, res) => {};
exports.getAll = async (req, res) => {};
exports.update = async (req, res) => {};
exports.delete = async (req, res) => {};
