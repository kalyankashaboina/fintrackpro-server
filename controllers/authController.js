const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../utils/nodemailer");
const cloudinary = require("../config/cloudinary.config"); 
const streamifier = require("streamifier");
const emailEmitter = require('../events/emailEvents');
const logger = require("../utils/logger");
const FRONTEND_URL = process.env.FRONTEND_URL;
// Register
exports.registerUser = async (req, res) => {
  const { name, email, password, profilePic = "" } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePic,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Emit registration email event
    emailEmitter.emit('sendRegistrationEmail', { email, name });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    logger.info(`Login attempt for email: ${email}`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// Log the FRONTEND_URL on init

exports.forgotPassword = async (req, res) => {
  
logger.info(`Using FRONTEND_URL: ${FRONTEND_URL}`); 
  const { email } = req.body;
  try {
    logger.info(`Forgot password requested for email: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`User not found for forgot password: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
    logger.info(`Generated reset link for ${email}: ${resetLink}`);

    emailEmitter.emit("sendForgotPasswordEmail", {
      email,
      name: user.name,
      resetLink,
    });

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    logger.error(`Error in forgotPassword for email ${email}: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Reset Password

exports.resetPassword = async (req, res) => {
  logger.info(`Using FRONTEND_URL: ${FRONTEND_URL}`); 
  const { token } = req.params;
  const { newPassword } = req.body;

  logger.info(`Password reset attempt with token: ${token}`);

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn(`Invalid or expired token used for password reset: ${token}`);
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    logger.info(`Password successfully reset for user ID: ${user._id} (email: ${user.email})`);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    logger.error(`Error during password reset with token ${token}: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  // console.log("Request body:", req.body);
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (req.file) {
      // Delete previous profilePic if exists
      if (user.profilePic) {
        const publicId = user.profilePic.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`profile_pics/${publicId}`);
        // console.log("Old profile pic deleted successfully from Cloudinary.");
      }

      // Upload new profile pic using stream
      const uploadStream = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "profile_pics",
              public_id: `user_${user._id}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const uploadResponse = await uploadStream();
      user.profilePic = uploadResponse.secure_url;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
