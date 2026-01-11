const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const env = require("../config/env");

class UserService {
  static async getAllUsers() {
    return await User.findAll();
  }

  static async signup({ username, email, password }) {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign(
      { user_id: userId, email, username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      user: { user_id: userId, username, email },
      token,
    };
  }

  static async login({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, username: user.username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
      token,
    };
  }
}

module.exports = UserService;
