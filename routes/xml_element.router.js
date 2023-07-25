const express = require("express");
const router = express.Router();
const element = require("../controllers/xml_element.controller");
router.post("/root", element.createRoot);
router.post("/attribute/:id", element.createAttribute);
router.post("/element/:id", element.createElement);
router.get("/:id", element.getChildrens);
router.get("/", element.getAll);
router.delete("/:id", element.deleteElement);
router.put("/:id", element.update);

module.exports = router;
