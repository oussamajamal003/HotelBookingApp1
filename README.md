=> I created a src folder to have this structure:

Server.js: Server startup

config folder:

db.js: Database connection pool

env.js: Environment variables

Controllers folder with users-controllers.js for User authentication handlers

Middlewares folder with authMiddleware.js for JWT token middleware

Models folder with User.js for User database

Routes folder with user-routers.js for User APIs routes

Services folder with userService.js for User logic

Test folder with authTest.js for Authentication test

Utils folder with responseHandler.js for response functions

Validator folder with authValidator.js to have Input validation for authentication

=> I Added Swagger UI for API documentation and testing.

i created guards for authentication and then updated routes,swagger

3 guards created:

-Auth Guard: checks JWT and allows access only if the user is authenticated.

-Role Guard: Ensures the authenticated user is an admin (here i added a column role in mysql)

-ownershipguard (now not used): Verify an authenticated user is permitted to access something like his profile for example

on api/auth/ and api/auth/logout routes i implemented a authguard

on api/auth/ route i implemented a roleguard("admin")

Login and signup are public because users are not authenticated


=> I Implemented Winston for logging (info, warn, error)

Integrated Morgan to log and monitore all HTTP requests

For Audits I Added in database in my users table (created_by, modified_by, timestamps) and audit_logs table for security events (login 

success/failure, signup, admin access).
  

For stress testing:

I use k6 and i installed it with: "winget install k6"

I also Added testing, logging and swagger configurations in env variables

I created tests/stress folder :

This folder contains 5 stress tests files for authentication and database load.

auth.login.test.js: Tests how the system behaves when many users 

try to log in at the same time.

auth.signup.test.js: Tests the system when many users create new accounts at once.

auth.logout.test.js : Tests if the system can handle many users logging out at the same time.

auth.getAllUsers.test.js : Tests how the system responds when many requests ask for the list of all users.

auth.db-load.test.js : Tests how the database handles heavy load when many users send requests at the same time.

for testing i use vscode terminal

for auth.signup.test.js by example i run it in vscode terminal

using : k6 run tests/stress/auth.signup.test.js

I can test it in normal scenario or override it to stress scenario

Also I added logs for normal and stress testing , k6 logging and db logging

