const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "hotel_booking_secret_key_2024";
const JWT_EXPIRES_IN = "1h";

const getUsers = (req, res) => {
  const q = "SELECT user_id, username, email, createdAt FROM users";

  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        error: "Failed to fetch users from database",
      });
    }
    if (data.length === 0) {
      return res.status(204).send();
    }
    return res.status(200).json({
      message: "Users fetched successfully",
      users: data,
    });
  });
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const q = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    
    db.query(q, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: "User already exists or database error",
        });
      }

      const newUserId = result.insertId;
      
      const token = jwt.sign(
        { user_id: newUserId, email: email, username: username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          user_id: newUserId,
          username: username,
          email: email,
        },
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Internal server error during signup",
    });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const q = "SELECT * FROM users WHERE email = ?";
  
  db.query(q, [email], async (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        error: "Failed to login",
      });
    }
    if (data.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = data[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  });
};

const logout = (req, res) => {
  return res.status(200).json({
    message: "Logout successful",
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.logout = logout;
