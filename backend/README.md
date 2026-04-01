# Shared Living Expenses & Task Management Backend

A fully functional Node.js backend with **JWT authentication**, user management, and secure API endpoints for managing shared expenses and tasks.

## 🚀 Features

### Authentication & User Management
- ✅ **User Registration (Signup)** with email validation
- ✅ **User Login** with JWT token generation
- ✅ **Password Hashing** using bcryptjs
- ✅ **Protected Routes** requiring authentication
- ✅ **Profile Management** (view, update profile)
- ✅ **Password Change** functionality
- ✅ **User Deletion** (delete own account)

### API Features
- ✅ RESTful API endpoints  
- ✅ JWT-based authentication (24-hour tokens)
- ✅ Input validation and error handling
- ✅ CORS support for frontend integration
- ✅ SQLite database with proper schema
- ✅ Role-based access control (users can only manage own data)

---

## 📋 Prerequisites

- **Node.js** v14 or higher
- **npm** v6 or higher
- **SQLite3** (included with backend)

---

## 🛠️ Installation & Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
node server.js
```

**Expected Output:**
```
Database tables initialized
Connected to SQLite database
Server running on http://localhost:5000
```

---

## 🔐 Quick Start - Authentication Flow

### 1. **Signup (Create Account)**
```bash
POST /api/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### 2. **Login (Get Token)**
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. **Use Token for Protected Routes**
```bash
GET /api/users/profile/me
Authorization: Bearer <your-jwt-token>
```

---

## 📚 API Endpoints

### Public Endpoints (No Token Required)
- `GET /api/health` - Server health check
- `POST /api/users/signup` - Create new user account
- `POST /api/users/login` - Login with email & password

### Protected Endpoints (Token Required)
- `GET /api/users/` - Get all users
- `GET /api/users/:id` - Get specific user
- `GET /api/users/profile/me` - Get current user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/change-password` - Change password
- `DELETE /api/users/:id` - Delete user account

---

## 📖 Documentation Files

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Comprehensive testing procedures

---

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT tokens with 24-hour expiration
- Bearer token authentication
- User ownership validation
- Email format validation
- Unique email/username constraints

---

## 🧪 Quick Test

```bash
# Health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123","confirmPassword":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for full testing procedures.

---

## 📦 Project Structure

```
backend/
├── server.js                 # Main server entry point
├── database.js               # Database initialization
├── package.json              # Dependencies
├── .env.example              # Environment template
├── API_DOCUMENTATION.md      # API reference
├── TESTING_GUIDE.md         # Testing guide
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/
│   ├── users.js             # Auth & user management
│   ├── expenses.js          # Expense tracking
│   ├── tasks.js             # Task management
│   └── settlements.js       # Settlement tracking
└── shared_expenses.db       # SQLite database
```

---

## 🚀 Deployment Ready

- Error handling for all endpoints
- Validated input and sanitization
- CORS configured for frontend
- Environment variable support
- Database auto-initialization
- Comprehensive logging

---

## 📝 License

MIT
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Remove user

### Expense Tracking
- **GET** `/api/expenses` - Get all expenses with participants
- **POST** `/api/expenses` - Create new expense
- **GET** `/api/expenses/:id` - Get expense details
- **PUT** `/api/expenses/:id` - Update expense
- **DELETE** `/api/expenses/:id` - Delete expense
- **GET** `/api/expenses/category/:category` - Filter by category

### Task Management
- **GET** `/api/tasks` - Get all tasks
- **POST** `/api/tasks` - Create new task
- **GET** `/api/tasks/:id` - Get task details with history
- **PUT** `/api/tasks/:id` - Update task status/details
- **DELETE** `/api/tasks/:id` - Delete task
- **GET** `/api/tasks/user/:userId` - Get tasks for user

### Settlements & Balances
- **GET** `/api/settlements/balances` - Get all user balances
- **GET** `/api/settlements/suggestions` - Get settlement recommendations
- **POST** `/api/settlements` - Record a payment
- **PUT** `/api/settlements/:id/complete` - Mark settlement as completed

## Request/Response Examples

### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

Response: 201
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Create Expense
```bash
POST /api/expenses
Content-Type: application/json

{
  "description": "Grocery shopping",
  "amount": 50.00,
  "paidBy": "user-id-1",
  "category": "Food",
  "splitWith": ["user-id-1", "user-id-2", "user-id-3"]
}
```

### Get Balances
```bash
GET /api/settlements/balances

Response: 200
{
  "user-id": {
    "name": "John",
    "balance": -25.50,
    "owes": {
      "user-id-2": 25.50
    }
  }
}
```

## Environment Variables

Create a `.env` file in the backend directory (optional):
```
PORT=5000
NODE_ENV=development
```

## Database

The application uses SQLite with the following tables:
- `users` - Household members
- `expenses` - Expense records
- `expense_participants` - Who shared each expense
- `tasks` - Task assignments
- `task_history` - Task status changes
- `settlements` - Payment records

Database is auto-initialized on first run.

## Debugging

To see detailed logs:
1. Check console output for errors
2. Verify CORS is configured for your frontend URL
3. Ensure all dependencies are installed
4. Database file should be created in backend root

## Performance Considerations

- Balances calculated on-demand (GET /settlements/balances)
- Expense queries include related participant data
- Indexed by date for faster filtering
- SQLite suitable for small-to-medium groups

## Deployment

Before deploying to production:
1. Set `NODE_ENV=production`
2. Update CORS origin to production URL
3. Use a proper database (PostgreSQL recommended)
4. Add authentication middleware
5. Enable HTTPS
6. Set up environment variables properly
