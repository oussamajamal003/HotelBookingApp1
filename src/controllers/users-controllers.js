const UserService = require("../Services/userService");

const getUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    if (!users || users.length === 0) {
      return res.status(204).send();
    }
    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const result = await UserService.signup({ username, email, password });
    return res.status(201).json({
      message: "User created successfully",
      ...result,
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.message === "User already exists") {
        return res.status(409).json({ error: "User already exists" });
    }
    return res.status(500).json({ error: "Internal server error during signup" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await UserService.login({ email, password });
    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.message === "Invalid email or password") {
        return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.status(500).json({ error: "Internal server error during login" });
  }
};

const logout = (req, res) => {
  return res.status(200).json({ message: "Logout successful" });
};

module.exports = {
  getUsers,
  signup,
  login,
  logout,
};

