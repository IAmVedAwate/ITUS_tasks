# Certificate Management System

## Overview
This project is a Certificate Management System built with Node.js and MongoDB. It provides a RESTful API for user authentication and certificate management, allowing users to register, log in, and manage certificates.

## Features
- JWT-based authentication for secure user access.
- Endpoints for managing certificates, including adding and retrieving certificates.
- Modular architecture with separate layers for controllers, services, models, and middleware.

## Project Structure
```
certificate-management-system
├── src
│   ├── controllers          # Contains controller files for handling requests
│   ├── models               # Contains Mongoose models for User and Certificate
│   ├── routes               # Contains route definitions for authentication and certificates
│   ├── services             # Contains business logic for authentication and certificate management
│   ├── middleware           # Contains middleware for authentication and error handling
│   └── app.js               # Entry point of the application
├── package.json             # NPM configuration file
├── .env                     # Environment variables
└── README.md                # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd certificate-management-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB connection string and JWT secret:
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```

4. Start the application:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- **POST /auth/register**: Register a new user.
- **POST /auth/login**: Authenticate user and return JWT.

### Certificate Management
- **POST /certificates**: Add a new certificate.
- **GET /certificates/:id**: Retrieve a certificate by ID.

## Usage
- Use a tool like Postman or curl to interact with the API.
- Ensure to include the JWT in the Authorization header for protected routes.

## License
This project is licensed under the MIT License.