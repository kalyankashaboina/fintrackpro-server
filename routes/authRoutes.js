const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  googleLogin,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { conditionalUpload } = require("../middlewares/upload");

router.post("/register", conditionalUpload, registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.put("/update-profile", protect, conditionalUpload, updateProfile);

module.exports = router;
