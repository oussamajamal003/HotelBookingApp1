# 📗 Student Management System — Server

![Status](https://img.shields.io/badge/Status-Active-success)
![Node](https://img.shields.io/badge/Node-v18+-green)
![Express](https://img.shields.io/badge/Express-5.0-gray)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

A robust, secure, and scalable backend API for managing student records, user authentication, and system auditing. Built with Node.js and Express, connected to a MySQL database.

---

## 📌 Project Overview

This backend server is a RESTful API designed to support the Student Management System. It handles data persistence, authentication validation, business logic execution, and security enforcement.

**Core Responsibilities:**
- **Secure API:** Provides endpoints protected by JWT and Role Guards.
- **Audit Trails:** Tracks critical actions (Create/Update/Delete) for security compliance.
- **Data Integrity:** Ensures valid data entry via middleware validation layers.

---

## ✨ Features

- **🔐 Authentication & Authorization:**
  - Standard Email/Password login with bcrypt hashing.
  - JWT (JSON Web Token) issuance and verification.
  - Granular `auth.guard` and `role.guard` middleware.
  - Account deletion support.

- **📜 Student Management Core:**
  - CRUD APIs for maintaining student records.
  - Efficient search and pagination for large datasets.

- **🕵️‍♂️ Audit Logging:**
  - Automatic logging of sensitive actions (`student_logs`).
  - Records *who* did *what* and *when*, including IP addresses.

- **🛡️ Security First:**
  - Password Hashing (bcrypt).
  - CORS configuration.
  - Centralized Error Handling.
  - Input Validation middleware.

---

## 🛠 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | ![Node](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) | JavaScript runtime environment |
| **Framework** | ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | Web framework for Node.js (v5) |
| **Database** | ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white) | Relational database management system |
| **Driver** | `mysql2` | Fast MySQL driver with Promise support |
| **Auth** | `jsonwebtoken`, `bcrypt` | Security standards |
| **Logging** | `winston` | Universal logging library |
| **Docs** | `swagger-ui-express` | API Documentation interface |

---

## 📁 Project Structure

```bash
Server/src/
├── config/              # Database connection (`db.js`) & Environment config
├── controllers/         # Request handlers (`student-controllers.js`, `users-controllers.js`)
├── docs/                # Swagger documentation components
├── guards/              # Security Middleware (`auth.guard.js`, `role.guard.js`, `ownership.guard.js`)
├── Middlewares/         # Global middlewares (`authMiddleware.js`)
├── Models/              # Database models (`Student.js`, `User.js`, `AuditLog.js`)
├── routes/              # API definitions (`authroutes.js`, `studentRoutes.js`)
├── scripts/             # Utility scripts, if any
├── Services/            # Business Logic (`studentService.js`, `userService.js`)
├── utils/               # Helpers (`logger.js`, `responseHandler.js`)
├── validator/           # Input validation rules (`authValidator.js`)
├── App.js               # Express application setup
└── Server.js            # Entry point (Port listening)
```

---

## ⚙️ Prerequisites

- **Node.js**: v18+
- **MySQL Database**: Running locally or remotely.
- **Database Tools**: MySQL Workbench or phpMyAdmin (optional).

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/student-management-app.git
   cd student-management-app/Server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root of the `Server` directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=yourpassword
   DB_NAME=student_db
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=24h
   ```

4. **Run the Database Scripts:**
   Execute the usage SQL scripts (if provided) or allow the models to sync (depending on implementation).

5. **Start the Server:**
   ```bash
   npm run dev
   ```
   > Server running on `http://localhost:5000`

---

## 🗄 Database Schema

### `users`
Administrators and authorized personnel.
- `user_id` (PK), `username`, `email`, `password` (hashed), `role`
- Audit fields: `created_by`, `modified_by`, `createdAt`, `modified_at`

### `students`
The core entity being managed.
- `id` (PK), `first_name`, `last_name`, `email`
- `created_at`

### `student_logs` / `audit_logs`
Audit trail for compliance.
- `student_id`, `action`, `performed_by`
- `old_data`, `new_data`, `ip_address`, `user_agent`

---

## 🔑 Authentication APIs

Base Endpoint: `/api/auth`

| Method | Endpoint | Description | Protected | Roles |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | List all registered users | ✅ | Admin |
| `POST` | `/login` | Authenticate user & receive JWT | ❌ | All |
| `POST` | `/signup` | Register a new user account | ❌ | All |
| `POST` | `/logout` | Clear session/cookie | ✅ | User |
| `DELETE` | `/delete` | Delete current user account | ✅ | User |

---

## 🎓 Student APIs

Base Endpoint: `/api/students`
*Note: All student routes are protected.*

| Method | Endpoint | Description | Protected | Roles |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/` | List all students (with search) | ✅ | Admin |
| `GET` | `/:id` | Get single student details | ✅ | Admin |
| `POST` | `/` | Create a new student | ✅ | Admin |
| `PUT` | `/:id` | Update student details | ✅ | Admin |
| `DELETE` | `/:id` | Remove a student | ✅ | Admin |

---

## 🔒 Security Features

1. **JWT & Guards:** 
   - Requests to `/api/students` are intercepted by `auth.guard`.
   - `role.guard("admin")` ensures strict access control for student records.
2. **Password Security:**
   - All passwords are salted and hashed using `bcrypt` before storage.
3. **Paramaterized Queries:**
   - MySQL2 is used with prepared statements to prevent SQL Injection.
4. **Audit Logging:**
   - Critical business actions are stored in `student_logs` and `AuditLog` for permanent record keeping.
5. **Input Validation:**
   - `authValidator` ensures request bodies are clean before processing.

---

## 📖 API Documentation

This API is documented using **Swagger**.

1. Start the server (`npm run dev`).
2. Visit **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**.
3. You can execute requests directly from the UI to test endpoints.

---

## 🧪 Testing the API

You can test endpoints using **Postman** or **cURL**:

1. **Login first:**
   - POST to `/api/auth/login` with JSON body `{ "email": "admin@test.com", "password": "pass" }`.
   - Copy the `token` from the response.

2. **Authenticated Requests:**
   - Add a Header: `Authorization: Bearer <your_token>`.
   - Example: GET `http://localhost:5000/api/students`.

---

## 📊 Logging & Auditing

The system maintains a dual-logging strategy:
1. **Console/File Logs:** Powered by `winston` (info/error rotation).
2. **Database Audit:** Critical business actions are stored in `student_logs` for permanent record keeping.

---

## 🚨 Error Handling

The application uses a centralized error handling middleware. 
- **400:** Bad Request (Validation failure).
- **401/403:** Auth failure / Forbidden.
- **500:** Internal Server Error (Database issues, logic crashes).
Errors are returned in a consistent JSON format: `{ "error": "Description" }`.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
