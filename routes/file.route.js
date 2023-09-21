const express = require("express");
const router = express.Router();
const file = require("../controllers/xmlFile.controller");
const authenticate = require("../middleware/auth.middleware");

router.post("/:id", file.create);
router.delete("/:id", file.delete);
router.put("/:id", file.update);
router.get("/", file.getAll);

module.exports = router;
