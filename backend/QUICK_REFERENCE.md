# Quick Reference - Authentication API

## 🚀 Start Backend
```bash
cd backend
node server.js
```
**URL:** http://localhost:5000

---

## 📝 Test User Credentials
```
Email: john@example.com
Password: password123
```

---

## 🔐 Authentication Endpoints

### Signup (Create Account)
```
POST /api/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Login (Get Token)
```
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes `token` - save this for protected requests!

---

## 🔒 Protected Endpoints (Add Token Header)

Header: `Authorization: Bearer <token>`

### Get My Profile
```
GET /api/users/profile/me
```

### Get All Users
```
GET /api/users/
```

### Update Profile
```
PUT /api/users/<user-id>

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### Change Password
```
POST /api/users/<user-id>/change-password

{
  "currentPassword": "password123",
  "newPassword": "newpass456",
  "confirmPassword": "newpass456"
}
```

### Delete Account
```
DELETE /api/users/<user-id>
```

---

## ✅ Test Commands (PowerShell)

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

### Signup
```powershell
$body = @{
    name="John"; email="john@example.com"; 
    password="pass123"; confirmPassword="pass123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users/signup" `
    -Method POST -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{email="john@example.com"; password="pass123"} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" `
    -Method POST -Body $body -ContentType "application/json"

$token = $response.token
```

### Get Profile (Protected)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/users/profile/me" `
    -Method GET -Headers @{"Authorization"="Bearer $token"}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `netstat -ano \| findstr :5000` then kill process |
| Module not found | Run `npm install` in backend folder |
| Database error | Delete `shared_expenses.db`, restart server |
| Invalid token | Copy entire token from login response |
| 401 Unauthorized | Add `Authorization: Bearer <token>` header |
| 403 Forbidden | Can only modify own account/profile |

---

## 📋 Database Schema

**Users Table:**
```sql
id (UUID)
name (UNIQUE)
email (UNIQUE)
password (hashed)
createdAt (timestamp)
```

---

## 🔑 Key Features

✅ Email-based authentication
✅ Password hashing (bcryptjs)
✅ JWT tokens (24-hour expiration)
✅ Secure password change
✅ Profile management
✅ Input validation
✅ Error handling
✅ CORS enabled

---

## 📚 Full Documentation

- **API_DOCUMENTATION.md** - Complete endpoint reference
- **TESTING_GUIDE.md** - Testing procedures & examples
- **README.md** - Full setup guide

