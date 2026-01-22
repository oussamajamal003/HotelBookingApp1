const UserService = require("../Services/userService");
const logger = require("../utils/logger");
const AuditLog = require("../Models/AuditLog");

const getUsers = async (req, res) => {
  try {
    const adminId = req.user ? req.user.user_id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const users = await UserService.getAllUsers(adminId, ipAddress);
    if (!users || users.length === 0) {
      return res.status(204).send();
    }
    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    logger.error(`Get users error: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const result = await UserService.signup({ username, email, password, ipAddress });
    return res.status(201).json({
      message: "User created successfully",
      ...result,
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`, { stack: error.stack });
    if (error.message === "User already exists") {
        return res.status(409).json({ error: "User already exists" });
    }
    if (error.message === "Username already exists") {
        return res.status(409).json({ error: "Username already exists" });
    }
    return res.status(500).json({ 
      error: "Internal server error during signup", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await UserService.login({ email, password, ipAddress });
    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`, { stack: error.stack });
    if (error.message === "Invalid email or password") {
        return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.status(500).json({ error: "Internal server error during login" });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user ? req.user.user_id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    if (userId) {
      logger.info(`User logged out: ${userId}`);
      await AuditLog.log({ userId, action: 'LOGOUT', ipAddress });
    }
    
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return res.status(200).json({ message: "Logout successful" }); // Still return success to user
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.user_id; // From authGuard
    const ipAddress = req.ip || req.connection.remoteAddress;

    await UserService.deleteUser(userId, ipAddress);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    logger.error(`Delete account error: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ error: "Failed to delete account" });
  }
};

module.exports = {
  getUsers,
  signup,
  login,
  logout,
  deleteUser,
};

