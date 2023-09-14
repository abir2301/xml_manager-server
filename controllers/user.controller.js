const userModel = require("../models/user.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, password, user_name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "email already exists" });
    }

    const user = new User({ email, password, user_name });
    await user.save();
    if (user) {
      const token = jwt.sign({ userId: user._id }, "your-secret-key");

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
        token: token,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password, user_name } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, "your-secret-key");

    return res.status(200).json({
      success: true,
      message: "User logedIn  successfully",
      data: user,
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const connectedUser = async (req, res) => {
  const user_id = req.userId;
  const user = await User.findById(user_id);
  if (user) {
    return res.status(200).json({
      success: true,
      message: "connected user ",
      data: {
        user,
      },
    });
  }
  return res.status(404).json({
    success: false,
    message: "not found user",
  });
};

module.exports = {
  register,
  login,
  connectedUser,
};
