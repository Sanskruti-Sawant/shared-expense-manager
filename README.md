# Shared Living Expense & Task Management System

A comprehensive full-stack web platform designed to help individuals living in shared environments (hostels, apartments, co-living spaces) manage shared expenses and responsibilities efficiently.

## 🎯 Features

### Expense Management
- **Add, Edit, and Categorize Expenses** - Record shared expenses with multiple categories (Food, Utilities, Rent, Entertainment, Transportation, Other)
- **Flexible Expense Splitting** - Split expenses equally among members or customize split amounts
- **Expense History** - Track all expenses with dates and details
- **Category Filtering** - View expenses by category for better analysis

### Task Management
- **Task Assignment** - Assign household responsibilities to members
- **Status Tracking** - Track task progress (Pending, In Progress, Completed)
- **Priority Levels** - Classify tasks by priority (Low, Medium, High)
- **Due Dates** - Set deadlines for tasks
- **Task History** - Monitor task completion history

### Financial Dashboard
- **Real-time Balance Calculation** - Automatically calculate who owes whom
- **Visual Balance Overview** - Bar charts showing member balances
- **Settlement Suggestions** - Get AI-powered settlement recommendations
- **Payment Tracking** - Record payments and settle debts

### Multi-User Support
- **Member Management** - Add, manage, and remove household members
- **User Profiles** - Store member names and emails
- **Role-based Data** - Each user sees personalized information

## 🏗️ Architecture

### Frontend (React)
- **App.js** - Main application with navigation
- **Components:**
  - `UserManagement.js` - Manage household members
  - `ExpenseManagement.js` - Add and track expenses
  - `TaskManagement.js` - Create and assign tasks
  - `BalancesDashboard.js` - View balances and settlements
- **Styling** - Responsive CSS with mobile support
- **API Integration** - Axios for backend communication

### Backend (Node.js/Express)
- **Server.js** - Express application setup
- **Database.js** - SQLite3 database initialization and utilities
- **Routes:**
  - `/api/users` - User management endpoints
  - `/api/expenses` - Expense tracking endpoints
  - `/api/tasks` - Task management endpoints
  - `/api/settlements` - Balance and settlement calculations

### Database (SQLite)
- **users** - Household members
- **expenses** - Shared expense records
- **expense_participants** - Tracks who shares each expense
- **tasks** - Household task assignments
- **task_history** - Task status change history
- **settlements** - Payment settlements between users

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## 📋 Usage Guide

### 1. Add Household Members
- Go to the **Members** tab
- Enter member name and email
- Click "Add Member"

### 2. Record Expenses
- Navigate to **Expenses** tab
- Fill in expense details (description, amount, payer)
- Select members who should split the expense
- Choose a category
- Click "Add Expense"

### 3. Assign Tasks
- Go to **Tasks** tab
- Enter task title and assign to a member
- Set priority and due date (optional)
- Click "Create Task"
- Update task status as it progresses

### 4. View Financial Summary
- Open **Dashboard** tab
- See each member's balance (positive = should receive, negative = owes)
- View settlement suggestions
- click "Mark as Paid" to record settlements

## 💾 Database Schema

### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### expenses
```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  paidBy TEXT NOT NULL,
  category TEXT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (paidBy) REFERENCES users(id)
)
```

### expense_participants
```sql
CREATE TABLE expense_participants (
  id TEXT PRIMARY KEY,
  expenseId TEXT NOT NULL,
  userId TEXT NOT NULL,
  amount REAL NOT NULL,
  splitType TEXT DEFAULT 'equal',
  FOREIGN KEY (expenseId) REFERENCES expenses(id),
  FOREIGN KEY (userId) REFERENCES users(id)
)
```

### tasks
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assignedTo TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  dueDate DATETIME,
  completedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignedTo) REFERENCES users(id)
)
```

### settlements
```sql
CREATE TABLE settlements (
  id TEXT PRIMARY KEY,
  fromUser TEXT NOT NULL,
  toUser TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  settledAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fromUser) REFERENCES users(id),
  FOREIGN KEY (toUser) REFERENCES users(id)
)
```

## 🔧 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Settlements
- `GET /api/settlements/balances` - Get all user balances
- `GET /api/settlements/suggestions` - Get settlement suggestions
- `POST /api/settlements` - Record a settlement
- `PUT /api/settlements/:id/complete` - Mark settlement as completed

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern Interface** - Clean, intuitive design with gradient headers
- **Visual Feedback** - Color-coded balances (green for credit, red for debt)
- **Charts & Graphs** - Bar charts for balance visualization
- **Real-time Updates** - Automatic data refresh after actions
- **Form Validation** - Client-side validation for user inputs

## 🛠️ Technology Stack

**Frontend:**
- React 18
- Axios (API client)
- Recharts (data visualization)
- date-fns (date handling)
- CSS3 (responsive styling)

**Backend:**
- Node.js
- Express.js
- SQLite3
- UUID (ID generation)

## 📱 Responsive Breakpoints

- **Desktop** - Full layout with all features
- **Tablet** (768px) - Adjusted grid layout
- **Mobile** (480px) - Single-column layout, optimized buttons

## 🚨 Error Handling

- Comprehensive error messages for API failures
- Validation for required fields
- Graceful handling of database errors
- User-friendly alert notifications

## 🔐 Security Considerations

- Input validation on both frontend and backend
- CORS enabled for frontend-backend communication
- UUID for secure ID generation
- Database prepared statements

## 🐛 Troubleshooting

### Backend won't start
- Ensure port 5000 is available
- Check Node.js installation
- Verify dependencies: `npm install`

### Frontend can't connect to backend
- Ensure backend is running on localhost:5000
- Check CORS settings in server.js
- Verify API URLs in utils/api.js

### Database errors
- Check "shared_expenses.db" file permissions
- Delete the database and restart to reinitialize: `rm backend/shared_expenses.db`

## 📈 Future Enhancements

- Authentication & authorization
- File uploads for expense receipts
- Recurring expenses
- Budget goals and alerts
- Expense analytics and reports
- Notification system
- Mobile app (React Native)
- Dark mode support
- Multi-household support
- Bill splitting algorithms
- Export data to CSV/PDF

## 📄 License

MIT License

## 👥 Contributors

Created as a comprehensive expense and task management solution for shared living spaces.

---

**Happy expense tracking! 💰**
