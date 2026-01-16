const pool = require("../config/db");
const logger = require("../utils/logger");

class AuditLog {
  static async log({ userId, action, details, ipAddress }) {
    try {
      await pool.query(
        "INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
        [userId || null, action, JSON.stringify(details), ipAddress || null]
      );
    } catch (error) {
      // If audit logging fails, we log it to file but don't crash the request
      logger.error(`Failed to write to audit_logs table: ${error.message}`);
    }
  }
}

module.exports = AuditLog;
