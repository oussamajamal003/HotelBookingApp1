const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const AuditLog = require("../Models/AuditLog");
const logger = require("../utils/logger");
const env = require("../config/env");

class UserService {
  static async getAllUsers(adminId, ipAddress) {
    logger.info(`Admin ${adminId} accessed all users list from IP: ${ipAddress}`);
    await AuditLog.log({ 
      userId: adminId, 
      action: 'ACCESS_ALL_USERS', 
      ipAddress 
    });
    return await User.findAll();
  }

  static async signup({ username, email, password, ipAddress }) {
    logger.info(`Attempting signup for email: ${email}`);
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      logger.warn(`Signup failed: Email already exists - ${email}`);
      throw new Error("User already exists");
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      logger.warn(`Signup failed: Username already exists - ${username}`);
      throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Default role for new users is 'admin' (changed in User model)
    const role = 'admin';
    // Public signup -> createdBy starts as null
    const userId = await User.create({ username, email, password: hashedPassword, role, createdBy: null });

    // FIX: Update audit fields so they are not null (user created themselves)
    // We do this immediately to ensure data consistency
    await User.updateAuditInfo(userId, userId, userId);

    logger.info(`User created successfully: ${username} (${userId})`);
    
    // Audit Logging
    // Use try-catch to ensure signup succeeds even if audit logging fails (though it shouldn't)
    try {
        await AuditLog.log({
          userId: userId,
          action: 'SIGNUP_SUCCESS',
          details: { username, email },
          ipAddress
        });
    } catch (auditErr) {
        logger.error(`Audit log failed for user signup ${userId}: ${auditErr.message}`);
    }

    const token = jwt.sign(
      { user_id: userId, email, username, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      user: { user_id: userId, username, email },
      token,
    };
  }

  static async login({ email, password, ipAddress }) {
    logger.info(`Login attempt for ${email} from ${ipAddress}`);
    
    const user = await User.findByEmail(email);
    if (!user) {
      logger.warn(`Login failed: User not found - ${email}`);
      await AuditLog.log({ userId: null, action: 'LOGIN_FAILURE', details: { email, reason: 'User not found' }, ipAddress });
      throw new Error("Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      logger.warn(`Login failed: Incorrect password - ${email}`);
      await AuditLog.log({ userId: user.user_id, action: 'LOGIN_FAILURE', details: { email, reason: 'Incorrect password' }, ipAddress });
      throw new Error("Invalid email or password");
    }

    logger.info(`Login successful for user: ${user.user_id}`);
    await AuditLog.log({ userId: user.user_id, action: 'LOGIN_SUCCESS', ipAddress });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  static async deleteUser(userId, ipAddress) {
    logger.info(`Attempting to delete user: ${userId}`);
    // Optional: Check if user exists or is super admin etc.
    const deleted = await User.delete(userId);
    if (!deleted) {
      throw new Error("User not found or could not be deleted");
    }

    await AuditLog.log({ 
      userId, 
      action: 'DELETE_ACCOUNT', 
      ipAddress 
    });
    
    return true;
  }
}

module.exports = UserService;
