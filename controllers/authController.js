const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary.config");
const streamifier = require("streamifier");
const emailEmitter = require("../events/emailEvents");
const logger = require("../utils/logger");
const {
  generateTokens,
  verifyRefreshToken,
  sendRefreshToken,
  validatePassword,
} = require("../utils/jwt-helper");
const FRONTEND_URL = process.env.FRONTEND_URL;

 const generateAndSaveTokens = async (user) => {
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = refreshToken; 
  await user.save();
  return { accessToken, refreshToken };
};


// Register
exports.registerUser = async (req, res) => {
  const { name, email, password, profilePic = "" } = req.body;
  try {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: "Password does not meet the requirements.",
        errors: passwordValidation.errors,
      });
    }

    let userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.provider === "google")
        return res
          .status(400)
          .json({
            message:
              "This email is registered with Google. Please log in with Google.",
          });
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePic,
      provider: "local",
    });

    // --- REFACTORED ---
    const { accessToken, refreshToken } = await generateAndSaveTokens(user);
    sendRefreshToken(res, refreshToken);

    emailEmitter.emit("sendRegistrationEmail", { email, name });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    logger.error(`Registration error for ${email}: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed (user not found) for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.provider === "google") {
      return res
        .status(400)
        .json({
          message:
            "This account uses Google Sign-In. Please use the 'Continue with Google' button.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed (invalid password) for email: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // --- REFACTORED ---
    const { accessToken, refreshToken } = await generateAndSaveTokens(user);
    sendRefreshToken(res, refreshToken);

    logger.info(`Successful login for email: ${email}`);
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    logger.error(`Login error for ${email}: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ accessToken: "" });

  try {
    const payload = verifyRefreshToken(token);
    if (!payload) return res.status(403).json({ accessToken: "" });

    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ accessToken: "" });
    }

    const { accessToken } = generateTokens(user); // Only need a new access token
    return res.json({ accessToken });
  } catch (err) {
    logger.error(`Refresh token error: ${err.message}`);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const payload = verifyRefreshToken(token);
      if (payload) {
        await User.updateOne(
          { _id: payload.id },
          { $unset: { refreshToken: "" } }
        );
      }
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(204).send();
  } catch (err) {
    logger.error(`Logout error: ${err.message}`);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.provider === "google") {
      logger.warn(
        `Forgot password attempt on non-existent or Google account: ${email}`
      );
      return res
        .status(200)
        .json({
          message:
            "If an account with that email exists, a reset link has been sent.",
        });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
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

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      logger.warn(`Invalid or expired token used for password reset.`);
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res
        .status(400)
        .json({
          message: "New password does not meet the requirements.",
          errors: passwordValidation.errors,
        });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // --- REFACTORED ---
    const { accessToken, refreshToken } = await generateAndSaveTokens(user);
    sendRefreshToken(res, refreshToken);

    logger.info(`Password successfully reset for user ID: ${user._id}`);
    res.json({ message: "Password reset successful", accessToken });
  } catch (err) {
    logger.error(`Error during password reset: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists)
        return res
          .status(400)
          .json({ message: "Email is already in use by another account." });
      user.email = email;
    }

    if (currentPassword && newPassword) {
      if (user.provider === "google" && !user.password)
        return res
          .status(400)
          .json({
            message:
              "Cannot set a password for an account created with Google.",
          });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });

      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid)
        return res
          .status(400)
          .json({
            message: "New password does not meet the requirements.",
            errors: passwordValidation.errors,
          });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "fintrackpro_profiles", resource_type: "image" },
        (error, result) => {
          if (error) logger.error("Cloudinary upload error:", error);
          if (result) user.profilePic = result.secure_url;
          user
            .save()
            .then((savedUser) => {
              res.status(200).json({
                message: "Profile updated successfully",
                user: {
                  id: savedUser._id,
                  name: savedUser.name,
                  email: savedUser.email,
                  profilePic: savedUser.profilePic,
                },
              });
            })
            .catch((err) => {
              res
                .status(500)
                .json({ message: "Server error on save", error: err.message });
            });
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      return;
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
    logger.error(
      `Update profile error for user ${req.user.id}: ${err.message}`
    );
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );
    if (!response.ok)
      return res.status(400).json({ message: "Invalid Google token" });

    const googleUser = await response.json();
    if (!googleUser.email)
      return res
        .status(400)
        .json({ message: "Google account information is missing an email." });

    const { name, email, picture } = googleUser;
    let user = await User.findOne({ email });

    if (user) {
      if (user.provider === "local")
        return res
          .status(400)
          .json({
            message:
              "An account with this email already exists. Please log in with your password.",
          });
      user.name = name;
      user.profilePic = user.profilePic || picture;
    } else {
      user = await User.create({
        name,
        email,
        profilePic: picture,
        provider: "google",
      });
      emailEmitter.emit("sendRegistrationEmail", { email, name });
    }

    // --- REFACTORED ---
    const { accessToken, refreshToken } = await generateAndSaveTokens(user);
    sendRefreshToken(res, refreshToken);

    emailEmitter.emit("sendLoginNotificationEmail", {
      email: user.email,
      name: user.name,
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    logger.error(`Google login server error: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
