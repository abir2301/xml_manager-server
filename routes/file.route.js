const express = require("express");
const router = express.Router();
const File = require("../controllers/xmlFile.controller");
const authenticate = require("../middleware/auth.middleware");
// router.post("/node/:id", authenticate, File.addXmlNode);
router.post("/:id", authenticate, File.create);
router.post("/xml/:id", authenticate, File.xmlFile);

router.delete("/:id", authenticate, File.delete);
router.put("/:id", authenticate, File.update);
router.get("/name", authenticate, File.getAllNames);

router.get("/:id", authenticate, File.getFile);

router.get("/", authenticate, File.getAll);

module.exports = router;
