const userModel = require("../models/user.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, password, user_name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ succes: false, message: "email already exists" });
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
    return res
      .status(500)
      .json({ succes: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

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
const getAllUsers = async (req, res) => {
  const user_id = req.userId;
  const users = await User.find();

  return res.status(404).json({
    success: true,
    message: "all users",
    data: users,
  });
};
const updateProfile = async (req, res) => {
  const user_id = req.userId;
  const { email, user_name } = req.body;

  try {
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "not found user",
      });
    }
    const userWithEmail = await User.findOne({ email: req.body.email });
    if (userWithEmail) {
      return res
        .status(409)
        .json({ succes: false, message: "email already exists" });
    }
    if (email) {
      user.email = email;
    }
    if (user_name) {
      user.user_name = user_name;
    }
    await user.save();

    return res.status(200).json({
      succes: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  connectedUser,
  getAllUsers,
  updateProfile,
};
