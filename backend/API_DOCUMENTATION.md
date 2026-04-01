# Shared Living Expenses Backend - API Documentation

## Authentication

This backend implements JWT (JSON Web Token) based authentication. All protected endpoints require a valid token in the `Authorization` header.

### Token Format
```
Authorization: Bearer <token>
```

---

## Public Endpoints (No Authentication Required)

### 1. **Signup** - Create a new user account
- **Route:** `POST /api/users/signup`
- **Description:** Register a new user with email and password
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
- **Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses:**
  - `400`: Name, email, password required / Invalid email / Password too short / Passwords don't match
  - `409`: User with this email or name already exists
  - `500`: Server error

### 2. **Login** - Authenticate with existing account
- **Route:** `POST /api/users/login`
- **Description:** Login with email and password to get a JWT token
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses:**
  - `400`: Email and password required
  - `401`: Invalid email or password
  - `500`: Server error

### 3. **Health Check**
- **Route:** `GET /api/health`
- **Description:** Check if server is running
- **Success Response (200):**
```json
{
  "status": "Server is running",
  "timestamp": "2024-03-31T10:30:00.000Z"
}
```

---

## Protected Endpoints (Authentication Required)

### 1. **Get All Users**
- **Route:** `GET /api/users/`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Get list of all users
- **Success Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-31T10:00:00.000Z"
  }
]
```

### 2. **Get User by ID**
- **Route:** `GET /api/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Get a specific user's information
- **Success Response (200):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-03-31T10:00:00.000Z"
}
```
- **Error Response (404):** User not found

### 3. **Get Current User Profile**
- **Route:** `GET /api/users/profile/me`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Get the authenticated user's profile
- **Success Response (200):** Same as Get User by ID

### 4. **Update User Profile**
- **Route:** `PUT /api/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Update user's name and/or email (can only update own profile)
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```
- **Success Response (200):** Updated user object
- **Error Responses:**
  - `403`: Can only update your own profile
  - `409`: Email already in use

### 5. **Change Password**
- **Route:** `POST /api/users/:id/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Change user's password (can only change own password)
- **Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```
- **Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```
- **Error Responses:**
  - `400`: Missing fields / Invalid password / Passwords don't match / Same as old password
  - `401`: Current password is incorrect
  - `403`: Can only change your own password
  - `404`: User not found

### 6. **Delete User Account**
- **Route:** `DELETE /api/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Delete user account (can only delete own account)
- **Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```
- **Error Responses:**
  - `403`: Can only delete your own account

---

## Usage Examples

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Current User (Protected):**
```bash
curl -X GET http://localhost:5000/api/users/profile/me \
  -H "Authorization: Bearer <your-token-here>"
```

### Using Postman

1. **Signup Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/users/signup`
   - Body (JSON):
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "confirmPassword": "password123"
   }
   ```

2. **Login Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/users/login`
   - Body (JSON):
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

3. **Protected Request (Get Current User):**
   - Method: GET
   - URL: `http://localhost:5000/api/users/profile/me`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer <token-from-login>`

---

## Installation & Running

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create .env file (optional, uses defaults):**
```bash
cp .env.example .env
```

3. **Start the server:**
```bash
npm start
```

Or with auto-reload (development):
```bash
npm run dev
```

The server will run on `http://localhost:5000` by default.

---

## Security Notes

1. **Password Requirements:**
   - Minimum 6 characters
   - Hashed using bcryptjs before storage
   - Never stored in plain text

2. **Token Security:**
   - JWT tokens expire after 24 hours
   - Tokens should be stored securely on the client
   - Always use HTTPS in production
   - Keep JWT_SECRET secure and change it in production

3. **Validation:**
   - Email format validation
   - Password confirmation matching
   - Unique email constraint
   - Unique username constraint

4. **Authorization:**
   - Users can only access/modify their own data
   - Protected routes check user ownership
   - Proper error handling for unauthorized access

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Troubleshooting

### Common Issues

**1. "Port already in use"**
- Change PORT in .env or environment variables
- Or kill the process using the port

**2. "Database connection error"**
- Ensure SQLite3 is properly installed
- Check file permissions for database directory

**3. "Token expired"**
- Login again to get a new token
- Tokens expire after 24 hours

**4. "Invalid token"**
- Ensure token is correctly formatted in Authorization header
- Ensure it's in format: `Bearer <token>`

---

## Future Enhancements

- Email verification for new accounts
- Password reset via email
- Role-based access control (RBAC)
- OAuth2 integration (Google, GitHub)
- Refresh token mechanism
- Account lockout after failed attempts
