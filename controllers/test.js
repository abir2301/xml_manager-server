// const { default: mongoose } = require("mongoose");
// const { XmlElement, xmlElementValidation } = require("../models/element.model");
// require("dotenv").config();
// const joi = require("joi");
// const { isValidObjectId, Types } = require("mongoose");

// exports.createRoot = async (req, res) => {
//   //input validation
//   const { error } = xmlElementValidation(req.body);
//   if (error) {
//     return error.details[0].message;
//   }
//   var root = await XmlElement.findOne({ parent_id: null });
//   if (root) {
//     res
//       .send({ success: false, message: "root element  already exists " })
//       .status(409);
//   } else {
//     try {
//       const rootElement = await XmlElement.create({
//         name: req.body.name,
//         type: null,
//         levelH: 0,
//         parent_id: null,
//         attribute_id: null,
//       });
//       res.status(200).send({
//         success: true,
//         message: "root element is  created  succesfully ",
//         data: rootElement,
//       });
//     } catch {
//       res.status(500).send({
//         success: false,
//         error: "some error occure while creating new rootElement   ",
//       });
//     }
//   }
// };
// //start from the root element , without attributes
// const getAllElements = async () => {
//   const xmlElements = await XmlElement.find();
//   const elements = [];
//   const root = await XmlElement.findOne({ parent_id: null });
//   if (root) {
//     elements.push(root._id.toString());
//   }
//   xmlElements.forEach(async (element) => {
//     element.childrens.forEach((e) => {
//       elements.push(e.toString());
//     });
//   });
//   return elements;
// };
// exports.createAttribute = async (req, res) => {
//   const { error } = xmlElementValidation(req.body);
//   if (error) {
//     res.send({ error: error.details[0].message }).status(400);
//   }
//   if (!isValidObjectId(req.params.id)) {
//     return res
//       .status(400)
//       .send({ success: false, message: "Invalid ID format." });
//   }
//   try {
//     var parent = await XmlElement.findOne({
//       _id: req.params.id,
//     }).exec();

//     if (!parent) {
//       res.status(409).send({ success: false, message: "Parent not found." });
//     } else {
//       // check if parent is valid element or not
//       const elements = await getAllElements();
//       if (!elements.includes(parent._id.toString())) {
//         return res
//           .status(400)
//           .send({ success: false, message: "not valid parent " });
//       }
//       const attributeElement = await XmlElement.create({
//         name: req.body.name,
//         type: req.body.type,
//         value: req.body.value,
//         levelH: 0,
//         parent_id: parent._id,
//       });
//       parent.attribute_id = attributeElement._id;
//       await parent.save();
//       res.status(200).send({
//         success: true,
//         message: "attribute  element is  created  succesfully ",
//         data: attributeElement,
//       });
//     }
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).send({
//       success: false,
//       error: "An error occurred while processing the request.",
//     });
//   }
// };
// exports.createElement = async (req, res) => {
//   const { error } = xmlElementValidation(req.body);
//   if (error) {
//     res.send({ error: error.details[0].message }).status(400);
//   }
//   if (!isValidObjectId(req.params.id)) {
//     return res
//       .status(400)
//       .send({ success: false, message: "Invalid ID format." });
//   }
//   try {
//     const elements = await getAllElements();
//     // is valid xml element or root element

//     var parent = await XmlElement.findOne({
//       _id: req.params.id,
//     }).exec();

//     if (!parent) {
//       res.status(409).send({ success: false, message: "Not Found Parent ." });
//     } else {
//       if (!elements.includes(parent._id.toString())) {
//         return res
//           .status(400)
//           .send({ success: false, message: "Invalid parent ." });
//       }
//       const element = await XmlElement.create({
//         name: req.body.name,
//         type: req.body.type,
//         value: req.body.value,
//         parent_id: parent._id,
//         lavelH: req.body.lavelH ? req.body.lavelH : parent.childrens.length + 1,
//       });

//       if (req.body.lavelH) {
//         const insertIndex = req.body.lavelH - 1;
//         parent.childrens.splice(insertIndex, 0, element._id);
//       } else {
//         parent.childrens.push(element._id);
//       }

//       await parent.save();

//       res.status(200).send({
//         success: true,
//         message: "xml element is  created  succesfully ",
//         data: element,
//       });
//     }
//   } catch (err) {
//     console.error("Error:", err);
//     res.status(500).send({
//       success: false,
//       error: "An error occurred while processing the request.",
//     });
//   }
// };

// exports.getAll = async (req, res) => {
//   const elements = await XmlElement.find();
//   res.send({
//     success: true,
//     data: elements,
//   });
// };

// const getChildrensRecursive = async (elementId) => {
//   const element = await XmlElement.findOne({ _id: elementId });
//   if (!element) {
//     return null;
//   }

//   const childrens = [];
//   for (const id of element.childrens) {
//     const child = await getChildrensRecursive(id);
//     if (child) {
//       childrens.push(child);
//     }
//   }

//   return { ...element.toObject(), childrens };
// };
// exports.getChildrens = async (req, res) => {
//   if (!isValidObjectId(req.params.id)) {
//     return res
//       .status(400)
//       .send({ success: false, message: "Invalid ID format." });
//   }
//   const parent = await XmlElement.findOne({ _id: req.params.id });
//   if (parent) {
//     // for (const id of parent.childrens) {
//     //   const element = await XmlElement.findOne({ _id: id });
//     //   childrens.push(element);
//     // }
//     const childrens = await getChildrensRecursive(parent._id);
//     console.log(childrens);
//     res.send({
//       success: true,
//       data: childrens,
//     });
//   } else {
//     res.status(404).send({ success: false, message: "Parent not found." });
//   }
// };
// exports.update = async (req, res) => {
//   try {
//     if (!isValidObjectId(req.params.id)) {
//       return res
//         .status(400)
//         .send({ success: false, message: "Invalid ID format." });
//     }
//     const { name, type, value, lavelH, attribute_id, parent_id } = req.body;
//     const element = await XmlElement.findByIdAndUpdate(req.params.id, {
//       name,
//       type,
//       value,
//       lavelH,
//     });

//     if (!element) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Element not found" });
//     }

//     res.json({ success: true, data: element });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
// const deleteElementAndChildren = async (elementId) => {
//   const element = await XmlElement.findById(elementId);
//   if (!element) {
//     return;
//   }

//   // Delete children recursively
//   for (const childId of element.childrens) {
//     await deleteElementAndChildren(childId);
//   }

//   // Delete the element itself
//   await XmlElement.findByIdAndDelete(elementId);
// };

// exports.deleteElement = async (req, res) => {
//   try {
//     const element = await XmlElement.findById(req.params.id);

//     if (!element) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Element not found" });
//     }

//     // Delete element and its children
//     await deleteElementAndChildren(req.params.id);
//     await deleteElementAndChildren(element.attribute_id);

//     // Optionally, you can remove the deleted element from its parent's childrens array.
//     if (element.parent_id) {
//       await XmlElement.findByIdAndUpdate(element.parent_id, {
//         $pull: { childrens: element._id },
//       });
//     }

//     res.json({ success: true, message: "Element and its children deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
