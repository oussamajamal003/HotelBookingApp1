const pool = require("../config/db");

class User {
  static async findAll() {
    const [rows] = await pool.query("SELECT user_id, username, email, role, created_by, modified_by, createdAt, modified_at FROM users");
    return rows;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  static async create({ username, email, password, role = 'user', createdBy = null }) {
    try {
      // Populating all 3 audit columns on initial creation
      const [result] = await pool.query(
        "INSERT INTO users (username, email, password, role, created_by, modified_by, createdAt, modified_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [username, email, password, role, createdBy, createdBy]
      );
      return result.insertId;
    } catch (error) {
      console.error("Database Insert Error:", error.message);
      throw error;
    }
  }

  static async findById(id) {
     const [rows] = await pool.query("SELECT user_id, username, email, role, created_by, modified_by, createdAt, modified_at FROM users WHERE user_id = ?", [id]);
     return rows[0];
  }

  static async updateAuditInfo(userId, createdBy, modifiedBy) {
    await pool.query(
      "UPDATE users SET created_by = ?, modified_by = ?, modified_at = NOW() WHERE user_id = ?",
      [createdBy, modifiedBy, userId]
    );
  }
}

module.exports = User;
