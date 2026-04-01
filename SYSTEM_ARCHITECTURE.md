# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer (React)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ UserMgmt     │  │ ExpenseMgmt  │  │ TaskMgmt     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Navigation & Main App Component           │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                          ↓ (HTTP/REST)
┌──────────────────────────────────────────────────────────┐
│              API Layer (Express.js)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  CORS Middleware │ Body Parser │ Route Handler  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────┐ ┌────────┐ ┌──────┐ ┌─────────────────┐   │
│  │Users │ │Expenses│ │Tasks │ │Settlements      │   │
│  │Route │ │ Route  │ │Route │ │Route            │   │
│  └──────┘ └────────┘ └──────┘ └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
                          ↓ (SQL)
┌──────────────────────────────────────────────────────────┐
│          Data Layer (SQLite Database)                    │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────────┐   │
│  │   users    │ │  expenses    │ │ expense_partc   │   │
│  └────────────┘ └──────────────┘ └─────────────────┘   │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────────┐   │
│  │   tasks    │ │ task_history │ │ settlements     │   │
│  └────────────┘ └──────────────┘ └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## 🔀 Request/Response Flow

### Adding an Expense
```
Frontend UI (ExpenseManagement.js)
    ↓
Form Submission (handleAddExpense)
    ↓
Client-side Validation
    ↓
Axios Request: POST /api/expenses
    {
      description,
      amount,
      paidBy,
      category,
      splitWith: [userIds]
    }
    ↓
Express Route Handler (/routes/expenses.js)
    ↓
Database Transactions:
    1. INSERT INTO expenses
    2. INSERT INTO expense_participants (for each user in splitWith)
    ↓
Response: 201 Created
    { id, description, amount, paidBy, category }
    ↓
Frontend Update State
    ↓
Refresh Expense List (fetchData → API.getAll)
    ↓
UI Re-renders with new expense
    ↓
Balance Dashboard notified (component refresh)
```

### Calculating Balances
```
User clicks Dashboard tab
    ↓
Component mounts (useEffect)
    ↓
API Call: GET /api/settlements/balances
    ↓
Backend Processing:
    1. Query ALL expenses
    2. For each expense:
       - Get paidBy user
       - Get participants
       - Calculate who owes what
    3. Build graph: User → {User: Amount}
    4. Calculate net balances
    ↓
Return: { userId: { name, balance, owes: {...} } }
    ↓
Frontend Displays:
    - Balance cards (color coded)
    - Bar chart
    - Settlement suggestions
```

## 💾 Data Normalization

### Expense Recording
```
When someone pays for a group:

Expense Record:
┌─────────────────────┐
│ id: uuid            │
│ description: "Food" │
│ amount: $60         │
│ paidBy: User.alice  │
│ category: "Food"    │
│ date: 2024-01-15    │
└─────────────────────┘

       ↓ Creates

Participant Records (one per person sharing):
┌────────────────────────────┐
│ expenseId: (FK)            │
│ userId: User.alice         │
│ amount: $20 (60/3)         │
├────────────────────────────┤
│ expenseId: (FK)            │
│ userId: User.bob           │
│ amount: $20 (60/3)         │
├────────────────────────────┤
│ expenseId: (FK)            │
│ userId: User.charlie       │
│ amount: $20 (60/3)         │
└────────────────────────────┘
```

## 🔢 Balance Calculation Algorithm

```javascript
Algorithm: CalculateBalances()

For each user U:
    balance[U] = 0
    
For each expense E:
    payer = E.paidBy
    participants = GetParticipants(E)
    
    For each participant P in participants:
        If P != payer:
            owes[payer][P] += P.amount
        
Calculate NetBalance:
    For each user U:
        balance[U] = 0
        
        // Money U is owed
        For each (creditor, amount) in owes[U]:
            balance[U] += amount
            
        // Money U owes
        For each (debtor) in users:
            If owes[debtor][U] exists:
                balance[U] -= owes[debtor][U]

Return balance (positive = should receive, negative = owes)
```

## 🎯 Component Lifecycle

### App Component
```
Mount
  ↓
Route/Tab State: 'dashboard'
  ↓
Render Active Component
  ↓
Component Mounts:
  └─ useEffect: fetch data
  └─ setState: populate UI
  ↓
User Interaction
  ↓
State Update → Re-render
  ↓
API Call → Update DB
  ↓
Refresh Data → Re-render
```

### Expense Component Lifecycle
```
Mount
  ↓
useEffect:
  1. Fetch all expenses
  2. Fetch all users
  3. setState
  ↓
Render:
  1. Form for new expense
  2. Filter dropdown
  3. List of expenses
  ↓
User adds expense
  ↓
handleAddExpense:
  1. Validate
  2. POST to API
  3. Clear form
  4. Fetch data (refresh)
  ↓
UI updates with new expense
```

## 🔗 API Contract

### Expense Creation Request
```json
POST /api/expenses
Content-Type: application/json

{
  "description": "Groceries",
  "amount": 60.50,
  "paidBy": "user-id-alice",
  "category": "Food",
  "splitWith": ["user-id-alice", "user-id-bob", "user-id-charlie"]
}
```

### Response
```json
201 Created

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Groceries",
  "amount": 60.50,
  "paidBy": "user-id-alice",
  "category": "Food"
}
```

### Balance Response
```json
GET /api/settlements/balances

{
  "user-id-alice": {
    "name": "Alice",
    "balance": 20.50,
    "owes": {}
  },
  "user-id-bob": {
    "name": "Bob",
    "balance": -20.50,
    "owes": {
      "user-id-alice": 20.50
    }
  }
}
```

## 🔒 Data Relationships

### Foreign Key Relationships
```
expenses.paidBy → users.id
expense_participants.userId → users.id
expense_participants.expenseId → expenses.id

tasks.assignedTo → users.id

task_history.taskId → tasks.id

settlements.fromUser → users.id
settlements.toUser → users.id
```

## 📊 Query Patterns

### Get Expense with Participants
```sql
SELECT e.*, u.name as paidByName 
FROM expenses e 
LEFT JOIN users u ON e.paidBy = u.id 
WHERE e.id = ?

-- Then fetch participants
SELECT ep.*, u.name 
FROM expense_participants ep 
LEFT JOIN users u ON ep.userId = u.id 
WHERE ep.expenseId = ?
```

### Get Balances (Complex Join)
```sql
SELECT 
  u.id, 
  u.name,
  SUM(CASE WHEN ep.userId = u.id THEN ep.amount ELSE 0 END) as owes_to_others,
  SUM(CASE WHEN e.paidBy = u.id THEN ep.amount ELSE 0 END) as others_owe_to_user
FROM users u
LEFT JOIN expenses e ON e.paidBy = u.id
LEFT JOIN expense_participants ep ON e.id = ep.expenseId
GROUP BY u.id
```

## 🎬 State Management Pattern

### Frontend State Structure
```javascript
// UserManagement
{
  users: [],
  newUser: { name: '', email: '' },
  loading: false
}

// ExpenseManagement
{
  expenses: [],
  users: [],
  newExpense: {
    description: '',
    amount: '',
    paidBy: '',
    category: 'Food',
    splitWith: []
  },
  filter: 'all'
}

// Dashboard
{
  balances: {},
  settlements: [],
  users: [],
  loading: false
}
```

## 🔄 CRUD Operations

### Create (POST)
```
Client Form → Validation → API POST → DB INSERT → Response → UI Update
```

### Read (GET)
```
Component Mount → API GET → DB Query → Response → State Update → Render
```

### Update (PUT)
```
User Action → Validation → API PUT → DB UPDATE → Response → Refresh List
```

### Delete (DELETE)
```
User Confirmation → API DELETE → DB DELETE (cascading) → Response → Refresh
```

## 🌐 Cross-Origin Communication (CORS)

```
Browser Request
  ↓ (includes Origin header)
Express CORS Middleware
  ↓ (checks allowed origins)
If allowed:
  ├─ Set Access-Control-Allow-* headers
  └─ Process request
If not allowed:
  └─ Return 403 Forbidden
```

## 📱 Responsive Adaptation

### Desktop (1024px+)
```
┌────────────────────────────────────────┐
│     Navigation (Horizontal)             │
├─────────────────────┬───────────────────┤
│                     │                   │
│   Form/List (50%)   │   Dashboard (50%) │
│                     │                   │
├─────────────────────┴───────────────────┤
│            Footer                       │
└────────────────────────────────────────┘
```

### Mobile (< 480px)
```
┌──────────────────────┐
│ Navigation (Scroll)  │
├──────────────────────┤
│                      │
│   Content (100%)     │
│                      │
├──────────────────────┤
│      Footer          │
└──────────────────────┘
```

## ⚙️ Error Handling Strategy

```
Request to API
    ↓
Try:
    Execute operation
    Return success
Catch:
    Log error to console
    Parse error message
    Return error response
    ↓
Frontend receives error
    ↓
Display user-friendly alert
Show in console for debugging
```

## 🎮 User Interactions Map

```
User Interaction → Event Handler → Validation → API Call → Database Update → UI Refresh
│                                                                            │
└────────────────────────────────────── Feedback Alert ─────────────────────┘
```

This architecture provides:
✅ Separation of concerns  
✅ Scalability for future features  
✅ Maintainability through modular design  
✅ Performance optimization opportunities  
✅ Clear data flow between layers
