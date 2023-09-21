const express = require("express");
const router = express.Router();
const file_schema = require("../controllers/file_schema.contoller");
const authenticate = require("../middleware/auth.middleware");

router.post("/", authenticate, file_schema.create);
router.post("/:id", authenticate, file_schema.SchemaFile);
router.get("/:id", authenticate, file_schema.getOne);
router.get("/", authenticate, file_schema.getAll);
router.delete("/:id", authenticate, file_schema.delete);
router.put("/:id", authenticate, file_schema.update);

module.exports = router;
