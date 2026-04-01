# Backend Testing Guide

## Running the Backend Server

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation & Startup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
node server.js

# Server will run on http://localhost:5000
```

**Expected Output:**
```
Database tables initialized
Connected to SQLite database
Server running on http://localhost:5000
```

---

## Testing with PowerShell (Windows)

### 1. Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

**Expected Output:**
```
status            timestamp
------            ---------
Server is running 2026-03-31T16:48:39.790Z
```

### 2. Signup - Create New User

```powershell
$body = @{
    name="John Doe"
    email="john@example.com"
    password="password123"
    confirmPassword="password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/users/signup" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response | ConvertTo-Json
```

**Expected Output:**
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

### 3. Login - Authenticate User

```powershell
$body = @{
    email="john@example.com"
    password="password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" | ConvertTo-Json
```

**Expected Output:**
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

### 4. Get Current User Profile (Protected Route)

```powershell
$token = "your-token-from-login"

Invoke-RestMethod -Uri "http://localhost:5000/api/users/profile/me" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

**Expected Output:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-03-31 16:48:54"
}
```

### 5. Get All Users (Protected Route)

```powershell
$token = "your-token-from-login"

Invoke-RestMethod -Uri "http://localhost:5000/api/users/" `
    -Method GET `
    -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

### 6. Update User Profile (Protected Route)

```powershell
$token = "your-token-from-login"
$userId = "user-id"

$body = @{
    name="Jane Doe"
    email="jane@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId" `
    -Method PUT `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

### 7. Change Password (Protected Route)

```powershell
$token = "your-token-from-login"
$userId = "user-id"

$body = @{
    currentPassword="oldpassword"
    newPassword="newpassword123"
    confirmPassword="newpassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/$userId/change-password" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json
```

### 8. Test Invalid Credentials (Error Handling)

```powershell
$body = @{
    email="john@example.com"
    password="wrongpassword"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
} catch {
    $_.Exception.Response.StatusCode
    $_.ErrorDetails.Message
}
```

**Expected Output:**
```
Unauthorized
{"error":"Invalid email or password"}
```

---

## Testing with Postman

### 1. Create Collection
- File → New → Collection
- Name: "Shared Expenses Auth"

### 2. Signup Request
- **Name:** Signup
- **Method:** POST
- **URL:** `http://localhost:5000/api/users/signup`
- **Tab: Body → Raw → JSON**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 3. Login Request
- **Name:** Login
- **Method:** POST
- **URL:** `http://localhost:5000/api/users/login`
- **Tab: Body → Raw → JSON**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 4. Get Profile Request (Protected)
- **Name:** Get Profile
- **Method:** GET
- **URL:** `http://localhost:5000/api/users/profile/me`
- **Tab: Headers**
  - Key: `Authorization`
  - Value: `Bearer <token-from-login>`

### 5. Update Profile Request
- **Name:** Update Profile
- **Method:** PUT
- **URL:** `http://localhost:5000/api/users/<user-id>`
- **Tab: Headers**
  - Key: `Authorization`
  - Value: `Bearer <token-from-login>`
- **Tab: Body → Raw → JSON**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

---

## Testing with cURL (Git Bash or WSL)

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### 2. Signup
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

### 3. Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 4. Get Profile (Protected)
```bash
curl -X GET http://localhost:5000/api/users/profile/me \
  -H "Authorization: Bearer <your-token>"
```

### 5. Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/<user-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com"
  }'
```

### 6. Change Password
```bash
curl -X POST http://localhost:5000/api/users/<user-id>/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

---

## Test Scenarios

### Scenario 1: Complete User Registration Flow
1. ✓ Health check (server is running)
2. ✓ Signup with valid credentials
3. ✓ Extract and save JWT token
4. ✓ Login with same credentials
5. ✓ Verify both produce valid tokens

### Scenario 2: Protected Routes Access
1. ✓ Login to get token
2. ✓ Use token to access `/api/users/profile/me`
3. ✓ Use token to get all users
4. ✓ Update user profile with token
5. ✓ Verify updates are saved

### Scenario 3: Error Handling
1. ✓ Signup with duplicate email (expect 409)
2. ✓ Signup with short password (expect 400)
3. ✓ Login with wrong password (expect 401)
4. ✓ Access protected route without token (expect 401)
5. ✓ Update someone else's profile (expect 403)

### Scenario 4: Password Management
1. ✓ Login with original password
2. ✓ Change password successfully
3. ✓ Login fails with old password
4. ✓ Login succeeds with new password

---

## Troubleshooting

### Issue: Server won't start

**Solution:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port
PORT=3000 node server.js
```

### Issue: "Cannot find module bcryptjs"

**Solution:**
```bash
npm install
```

### Issue: "Invalid token"

**Solution:**
- Ensure token is in correct format: `Bearer <token>`
- Ensure token hasn't expired (24 hours)
- Copy the entire token from response

### Issue: CORS errors

**Solution:**
- Ensure frontend is using correct origin
- Check CORS configuration in server.js
- For development, CORS allows all origins

### Issue: Database locked

**Solution:**
```bash
# Delete database and restart
del backend\shared_expenses.db
node server.js
```

---

## Database Access

To directly inspect the database:

```bash
# Open SQLite database
sqlite3 backend/shared_expenses.db

# List all users
SELECT * FROM users;

# Check schema
.schema users

# Exit
.quit
```

---

## Performance Testing

### Load Testing with ApacheBench (if installed)

```bash
# Test signup endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -p data.json -T application/json http://localhost:5000/api/users/signup
```

### Concurrent Login Attempts

```powershell
# Test 5 concurrent login requests
1..5 | ForEach-Object {
    $body = @{email="john@example.com"; password="password123"} | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" `
        -Method POST -Body $body -ContentType "application/json"
} | Measure-Object
```

