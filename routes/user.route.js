const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const router = express.Router();
const user = require("../controllers/user.controller");
router.post("/login", user.login);
router.post("/register", user.register);
router.get("/", authenticate, user.connectedUser);

module.exports = router;
