const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const router = express.Router();
const user = require("../controllers/user.controller");
router.get("/", authenticate, user.getUser);

router.post("/login", user.login);
router.post("/register", user.register);

router.put("/", authenticate, user.updateProfile);
module.exports = router;
