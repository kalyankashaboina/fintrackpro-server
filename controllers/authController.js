const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../utils/nodemailer");
const cloudinary = require("../config/cloudinary.config");
const streamifier = require("streamifier");
const emailEmitter = require("../events/emailEvents");
const logger = require("../utils/logger");
const FRONTEND_URL = process.env.FRONTEND_URL;

// Register
exports.registerUser = async (req, res) => {
  const { name, email, password, profilePic = "" } = req.body;
  try {
    let userExists = await User.findOne({ email });
    if (userExists) {
        // If user exists and signed up with Google, guide them.
        if (userExists.provider === 'google') {
            return res.status(400).json({ message: "This email is registered with Google. Please log in with Google." });
        }
        return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePic,
      provider: 'local', // UPDATED: Set provider for local registration
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    
    emailEmitter.emit("sendRegistrationEmail", { email, name });

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
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // UPDATED: Check if a Google user is trying to log in with a password
    if (user.provider === 'google') {
        return res.status(400).json({ message: "This account uses Google Sign-In. Please use the 'Continue with Google' button." });
    }

    // user.password will exist here because provider is 'local'
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

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

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`User not found for forgot password: ${email}`);
      // Send a generic message for security reasons
      return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    // UPDATED: Prevent password reset for Google accounts
    if (user.provider === 'google') {
        logger.warn(`Forgot password attempt on a Google account: ${email}`);
        return res.status(400).json({ message: "This account was created using Google Sign-In and does not have a password to reset." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
    
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
  // This function remains the same, as the check in forgotPassword prevents it from being called for Google users.
  const { token } = req.params;
  const { newPassword } = req.body;

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

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    if (currentPassword && newPassword) {
      // UPDATED: Check if the user is a Google user before allowing password change
      if (user.provider === 'google' && !user.password) {
        return res.status(400).json({ message: "Cannot set a password for an account created with Google." });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    // The rest of the function for file upload remains the same
    if (req.file) {
      // ... file upload logic ...
    }

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    if (!response.ok) {
      const errorData = await response.json();
      logger.error("Invalid Google token received:", errorData);
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const googleUser = await response.json();
    const { name, email, picture } = googleUser;
    let user = await User.findOne({ email });

    if (user) {
      if(user.provider === 'local') {
          return res.status(400).json({ message: "An account with this email already exists. Please log in with your password." });
      }
      user.name = name;
      user.profilePic = user.profilePic || picture;
      await user.save();
      emailEmitter.emit("sendLoginNotificationEmail", { email: user.email, name: user.name });
    } else {
      user = await User.create({
        name,
        email,
        profilePic: picture,
        provider: 'google',
      });
      emailEmitter.emit("sendRegistrationEmail", { email, name });
    }

    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({
      token: appToken,
      user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic },
    });
  } catch (err) {
    logger.error(`Google login server error: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};