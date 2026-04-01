# 🚀 Budget Planner - Quick Start Guide

Get your Shared Household Expense Tracker up and running in 5 minutes!

## Step 1: Start the Backend

Open a terminal and run:

```bash
cd backend
npm install
npm run dev
```

You should see:
```
Server running on http://localhost:5000
```

## Step 2: Start the Frontend

Open a **new terminal** and run:

```bash
cd frontend
npm install
npm start
```

The app will automatically open at `http://localhost:3000`

## Step 3: Add Your First Member

1. Scroll to the **"👥
2. Enter a member's name (e.g., "Alice")
3. Click **"➕ Add"**
4. Repeat for other household members

## Step 4: Record Your First Expense

1. Scroll to the **"📊 Recent Expenses"** section
2. Click **"➕ Add New Expense"**
3. Enter expense details:
   - Description: "Groceries"
   - Amount: 60
   - Paid By: Select a member
   - Category: Food
   - Split with: Check all members who share
4. Click **"✅ Add Expense"**

## Step 5: View Budget Breakdown

1. Scroll to the **"📈 Spending by Category"** section
2. See spending distribution across Food, Rent, Utilities, etc.
3. View your total monthly spending

## Step 6: Create Tasks

1. Scroll to the **"✓ Household Tasks"** section
2. Create task with:
   - Task title: "Clean the kitchen"
   - Assign to: A member
   - Priority: Medium
   - Due date: Pick a date
3. Click **"✅ Create Task"**

## Step 7: Check Settlement Summary

1. Scroll to the **"Settlement Summary"** section
2. See who owes what
3. Click **"Record a Payment"** to settle balances

## 💡 Key Features

**Dashboard**
- Total household expenses
- Average spending per person
- Member count

**Household Members**
- Add/manage all members
- View member list at a glance

**Recent Expenses**
- Track all household expenses
- Add new expenses with categories
- See who paid and split amounts
- Filter by date

**Spending by Category**
- Visualize spending distribution
- Food, Rent, Utilities, Entertainment, Transport, Other
- See percentages and totals

**Household Tasks**
- Create and assign tasks
- Set priorities (Low, Medium, High)
- Track due dates
- View active tasks

**Settlement Summary**
- See who owes whom
- Balance calculations
- Record payments

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check port 5000 is free: `netstat -ano \| findstr :5000` |
| Frontend can't connect | Ensure backend running on localhost:5000 |
| No data showing | Refresh page, check browser console |
| CORS errors | Ensure backend has CORS enabled (it does by default) |

## 📊 Example Scenario

**Apartment with 3 people:**

1. Add members: Alice, Bob, Charlie
2. Record expenses:
   - Alice paid $60 for groceries (split 3 ways)
   - Bob paid $150 for rent (split 3 ways)
   - Charlie paid $30 for utilities (split 3 ways)
3. View settlements:
   - Alice gets $30 back from Bob and Charlie
   - Bob gets $10 back, etc.
4. Record payments to settle balances
2. Alice buys groceries ($60) - split 3 ways
3. Bob pays rent ($300) - everyone pays share
4. Charlie buys drinks ($30) - split 2 ways only

Dashboard shows:
- Alice: -20 (gets back $20)
- Bob: +100 (gets back $100)
- Charlie: -80 (owes $80)

Settlement suggestions:
- Alice pays Bob $20
- Charlie pays Bob $80

## 🎨 UI Overview

```
       ┌─────────────────────────────────┐
       │  🏠 Shared Living Manager      │
       └─────────────────────────────────┘
       ┌─ 💰 Dashboard | 📊 Expenses | ✓ Tasks | 👥 Members ─┐
       │                                                      │
       │  Main Content Area (Active Tab Content)             │
       │                                                      │
       │  ┌──────────┬──────────┬──────────┐                 │
       │  │ Member 1 │ Member 2 │ Member 3 │ (Balance Cards) │
       │  └──────────┴──────────┴──────────┘                 │
       │                                                      │
       │  [Chart and Settlement Suggestions]                 │
       │                                                      │
       └──────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
Add Expense in UI
       ↓
Send to Backend API
       ↓
Store in Database
       ↓
Calculate Balances
       ↓
Update Dashboard
```

## 📱 Compatible With

✅ Desktop Chrome/Firefox  
✅ Tablets  
✅ Mobile browsers  
✅ Windows/Mac/Linux  

## 📚 Learn More

- [Main README.md](./README.md) - Full documentation
- [Backend README.md](./backend/README.md) - API details
- [Frontend README.md](./frontend/README.md) - Component guide

## 🎓 Features Walkthrough

### Dashboard
View real-time balances and settlement suggestions with visual charts

### Expenses
- Add expenses with flexible splitting
- Categorize spending
- Filter and view history

### Tasks
- Assign household chores
- Track progress
- Set priorities and deadlines

### Members
- Add household members
- Manage user information
- Remove invalid entries

## ⚡ Pro Tips

1. **Equal Split** - Select all members when splitting
2. **Custom Split** - Create one expense at a time for custom amounts
3. **Categories** - Use categories to track spending patterns
4. **Priorities** - Mark important tasks as "High"
5. **Due Dates** - Set dates to stay on schedule

## 🚀 Next Steps

- Familiarize yourself with the dashboard
- Add all household members
- Start logging expenses
- Assign regular household tasks
- Check settlements weekly

---

**Happy managing! Questions? Check the detailed documentation above.** 📖

---

## Quick Reference

| Action | Location |
|--------|----------|
| Add member | Members tab |
| Add expense | Expenses tab |
| Create task | Tasks tab |
| View balances | Dashboard tab |
| Check who owes | Dashboard tab |
| Filter expenses | Expenses tab |
| Update task status | Tasks tab |
| Record payment | Dashboard tab |

Enjoy your streamlined household management! 🎉
