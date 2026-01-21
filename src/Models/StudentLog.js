const pool = require("../config/db");
const logger = require("../utils/logger");

class StudentLog {
  /**
   * Logs a student-related action to the database and file system.
   * Handles errors internally to ensure main flow isn't interrupted.
   *  
   * @param {Object} params
   * @param {number|null} params.studentId - ID of the affected student (nullable for lists)
   * @param {string} params.action - CREATE, UPDATE, DELETE, VIEW, LIST
   * @param {number} params.performedBy - User ID of the admin performing the action
   * @param {Object|null} params.oldData - JSON snapshot of data before change
   * @param {Object|null} params.newData - JSON snapshot of data after change
   * @param {string} params.ipAddress - Request IP address
   * @param {string} params.userAgent - Request User-Agent
   */
  static async logAction({ studentId, action, performedBy, oldData, newData, ipAddress, userAgent }) {
    // 1. Log to File System (using existing logger)
    const logDetails = {
      studentId,
      action,
      performedBy,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString()
    };
    
    // We log to info with structured metadata
    logger.info(`Student Action: ${action}`, { 
      service: 'student-audit',
      ...logDetails
    });

    // 2. Log to Database
    try {
      const query = `
        INSERT INTO student_logs 
        (student_id, action_type, performed_by, old_data, new_data, ip_address, user_agent, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const safeOldData = oldData ? JSON.stringify(oldData) : null;
      const safeNewData = newData ? JSON.stringify(newData) : null;

      await pool.query(query, [
        studentId || null,
        action,
        performedBy,
        safeOldData,
        safeNewData,
        ipAddress || null,
        userAgent || null
      ]);
    } catch (error) {
      // 3. Fallback/Error Handling: Log the failure to file but don't throw
      logger.error(`Database Logging Failed for ${action}: ${error.message}`, {
        stack: error.stack,
        auditPayload: logDetails
      });
    }
  }
}

module.exports = StudentLog;
