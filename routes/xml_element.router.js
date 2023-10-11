const express = require("express");
const router = express.Router();
const element = require("../controllers/xml_element.controller");
const authenticate = require("../middleware/auth.middleware");

router.post("/value/:id", element.assignValue);
router.post("/sub/:id", element.subElements);
router.post("/:id", element.create);

router.get("/", element.getAll);
router.delete("/:id", element.delete);
router.put("/:id", element.update);

module.exports = router;
