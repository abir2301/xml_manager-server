const express = require("express");
const router = express.Router();
const file_schema = require("../controllers/file_schema.contoller");
router.post("/", file_schema.create);
router.post("/:id", file_schema.SchemaFile);
router.get("/:id", file_schema.getOne);
router.get("/", file_schema.getAll);
router.delete("/:id", file_schema.delete);
router.put("/:id", file_schema.update);

module.exports = router;
