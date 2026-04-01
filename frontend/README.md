# Frontend Setup Instructions

## Prerequisites
- Node.js v14+
- npm
- Backend API running on `http://localhost:5000`

## Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html            # Main HTML file
├── src/
│   ├── App.js               # Main application component
│   ├── App.css              # Main styling
│   ├── index.js             # React entry point
│   ├── components/
│   │   ├── UserManagement.js        # Add/manage household members
│   │   ├── ExpenseManagement.js     # Add and track expenses
│   │   ├── TaskManagement.js        # Assign and track tasks
│   │   └── BalancesDashboard.js     # View balances and settlements
│   ├── styles/
│   │   └── Dashboard.css     # Component-specific styling
│   └── utils/
│       └── api.js            # API client configuration
└── package.json              # Dependencies
```

## Components

### App.js
Main navigation and layout component. Handles tab switching between:
- Dashboard (Financial overview)
- Expenses (Expense tracking)
- Tasks (Task management)
- Members (User management)

### UserManagement.js
Manage household members:
- Add new member with name/email
- View all members
- Remove members

### ExpenseManagement.js
Track shared expenses:
- Add expenses with amount, category, payer
- Flexible expense splitting
- Filter by category
- View expense history
- Delete expenses

### TaskManagement.js
Manage household tasks:
- Create tasks with title, description, assignee
- Set priority (Low/Medium/High)
- Set due dates
- Update task status (Pending/In Progress/Completed)
- Filter by status
- Delete tasks

### BalancesDashboard.js
Financial overview:
- Real-time balance calculation
- Visual representation (who owes whom)
- Settlement suggestions
- Record payments
- Bar chart visualization

## Styling

### Responsive Breakpoints
- **Desktop** (1024px+) - Full layout
- **Tablet** (768px - 1024px) - Adjusted grid
- **Mobile** (<768px) - Single column

### Color Scheme
- Primary: #3b82f6 (Blue)
- Success: #10b981 (Green)
- Danger: #ef4444 (Red)
- Warning: #f59e0b (Orange)
- Background: #f9fafb (Light gray)

### CSS Classes
- `.btn-primary` - Primary action button
- `.btn-success` - Success/positive action
- `.btn-danger` - Destructive action
- `.balance-card` - Member balance display
- `.expense-card` - Individual expense
- `.task-card` - Individual task

## API Configuration

Edit `src/utils/api.js` to change API endpoint:
```javascript
const API_BASE = 'http://localhost:5000/api'; // Change this
```

## State Management

Each component manages its own state:
- `UserManagement` - users list
- `ExpenseManagement` - expenses, users, filters
- `TaskManagement` - tasks, users, filters
- `BalancesDashboard` - balances, settlements

## Features in Detail

### Add Member
1. Go to Members tab
2. Enter name and email
3. Click "Add Member"

### Add Expense
1. Go to Expenses tab
2. Enter description, amount
3. Select who paid
4. Choose category
5. Select members to split with
6. Click "Add Expense"

### Assign Task
1. Go to Tasks tab
2. Enter task title
3. Select assignee
4. Set priority and due date (optional)
5. Add description if needed
6. Click "Create Task"

### View Balances
1. Go to Dashboard tab
2. See member balance cards
3. View settlement suggestions
4. Click "Mark as Paid" to record payments

## Error Handling

- Connection errors to backend are logged to console
- User-friendly alerts for validation errors
- Loading states while fetching data
- Auto-refresh after successful operations

## Performance

- Automatic data loading on component mount
- Efficient form handling with controlled inputs
- Chart rendering only when data changes
- Optimized re-renders with component structure

## Development Tips

### Check Backend Connection
```javascript
// In browser console:
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
```

### Add Debug Logging
```javascript
const response = await userAPI.getAll();
console.log('Users:', response.data);
```

### Common Issues

**"Cannot GET /api/..."**
- Backend not running
- Check `http://localhost:5000/api/health`
- Verify backend port in `src/utils/api.js`

**Blank page**
- Check browser console for errors
- Verify React installed: `npm install react react-dom`
- Check if backend API is responding

**Styling not appearing**
- Clear browser cache (Ctrl+Shift+Delete)
- Reload page (Ctrl+F5)
- Check console for CSS errors

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests (if configured)
- `npm run eject` - Eject from Create React App (irreversible)

## Customization

### Change Color Scheme
Edit `src/App.css`:
```css
:root {
  --primary-color: #your-color;
  /* other colors */
}
```

### Add New Component
1. Create file in `src/components/NewComponent.js`
2. Import in `App.js`
3. Add navigation button
4. Handle in tab switching logic

### Modify API
Edit `src/utils/api.js` to add new endpoints

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

- User authentication
- Real-time notifications
- Expense receipts
- Advanced analytics
- Export data
- Mobile app
- Dark mode
