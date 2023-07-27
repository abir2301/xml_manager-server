const express = require("express");
const router = express.Router();
const element = require("../controllers/xml_element.controller");
router.post("/", element.create);
router.get("/", element.getAll);
router.delete("/:id", element.delete);
router.put("/:id", element.update);

module.exports = router;
