const express = require("express");
const User = require("../models/userModel");
const { expressAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users
router.get("/", expressAuth, async (req, res) => {
  const users = await User.find(
    { _id: { $ne: req.user.id } },
    { password: 0 } // exclude password
  ).lean();
  res.json(users);
});

module.exports = router;
