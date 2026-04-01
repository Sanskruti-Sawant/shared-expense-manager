# Deployment & Enhancement Guide

## 🚀 Deployment Options

### Option 1: Local Deployment

**Best for:** Personal use, small group testing

```bash
# Terminal 1: Backend
cd backend
npm install
npm start  # or npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm start
```

Access at: `http://localhost:3000`

### Option 2: Docker Deployment

**Best for:** Consistent environments, cloud deployment

Create `Dockerfile` in backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 5000
```

Create `Dockerfile` in frontend:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 3: Cloud Deployment

#### Heroku
```bash
# Backend
git init
heroku create shared-expenses-backend
git push heroku main

# Set environment variables
heroku config:set PORT=5000
```

#### AWS
- **EC2**: Deploy Node.js backend
- **S3**: Host React frontend
- **RDS**: Use PostgreSQL instead of SQLite

#### Azure
- **App Service**: Deploy backend
- **Static Web Apps**: Host frontend
- **CosmosDB**: Database option

#### DigitalOcean
- **App Platform**: Deploy both services
- **Managed Database**: PostgreSQL

### Option 4: Production Setup

**For production use:**

1. **Database Migration** (SQLite → PostgreSQL)
```bash
# Install PostgreSQL
npm install pg

# Update database.js connection
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

2. **Environment Variables**
```bash
# Create backend/.env
PORT=5000
DATABASE_URL=postgresql://user:pass@host/db
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

3. **CORS Configuration**
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

4. **Authentication** (Recommended)
Add JWT tokens:
```bash
npm install jsonwebtoken bcryptjs
```

5. **SSL/HTTPS**
Use Let's Encrypt or AWS Certificate Manager

## 📈 Performance Optimization

### Frontend Optimizations
```javascript
// Code splitting
const UserManagement = React.lazy(() => 
  import('./components/UserManagement')
);

// Memoization
const UserCard = React.memo(({ user }) => {...});

// useCallback for handlers
const handleDelete = useCallback((id) => {...}, []);
```

### Backend Optimizations
```javascript
// Connection pooling for PostgreSQL
const pool = new Pool({ max: 20 });

// Database indexing
CREATE INDEX idx_expenses_paidby ON expenses(paidBy);
CREATE INDEX idx_expense_partc_userid ON expense_participants(userId);

// Query optimization
SELECT ... FROM expenses WHERE date > ? LIMIT 100;
```

### Caching Strategy
```javascript
// Redis caching for balances
const redis = require('redis');
const client = redis.createClient();

// Cache balance calculations (5 min TTL)
const cachedBalance = await client.get('balances');
```

## 🔐 Security Hardening

### 1. Input Validation
```javascript
// Validate all inputs
const { body, validationResult } = require('express-validator');

router.post('/', [
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail(),
  body('amount').isFloat({ min: 0.01 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
});
```

### 2. Authentication
```javascript
// Add JWT auth
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

router.use(authenticateToken);
```

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. SQL Injection Prevention
```javascript
// Always use parameterized queries
// Good: db.get('SELECT * FROM users WHERE id = ?', [id]);
// Bad: db.get('SELECT * FROM users WHERE id = ' + id);
```

### 5. HTTPS Enforcement
```javascript
const https = require('https');
const fs = require('fs');

https.createServer({
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
}, app).listen(5000);
```

## 🧪 Testing Setup

### Unit Tests (Jest + Supertest)
```bash
npm install --save-dev jest supertest
```

```javascript
// tests/routes/expenses.test.js
const request = require('supertest');
const app = require('../server');

describe('Expenses API', () => {
  it('should create an expense', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({
        description: 'Test',
        amount: 50,
        paidBy: 'user-id'
      });
    expect(res.statusCode).toBe(201);
  });
});
```

### E2E Tests (Cypress)
```bash
npm install --save-dev cypress
```

```javascript
// cypress/integration/expense.spec.js
describe('Expense Management', () => {
  it('should add an expense', () => {
    cy.visit('http://localhost:3000');
    cy.get('input[placeholder="Expense description"]')
      .type('Groceries');
    cy.contains('Add Expense').click();
    cy.contains('Groceries').should('exist');
  });
});
```

## 🔍 Monitoring & Logging

### Logger Setup (Winston)
```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('Expense created', { expenseId, amount });
```

### Error Tracking (Sentry)
```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'YOUR_DSN' });
app.use(Sentry.Handlers.errorHandler());
```

## 🎯 Future Enhancement Roadmap

### Phase 2: Social Features
- [ ] Notifications (email/SMS)
- [ ] Activity feed
- [ ] User comments on expenses
- [ ] Recurring expenses
- [ ] Budget goals

### Phase 3: Advanced Analytics
- [ ] Spending trends
- [ ] Category breakdown charts
- [ ] Monthly reports
- [ ] Predictive analytics
- [ ] Export to CSV/PDF

### Phase 4: Mobile Integration
- [ ] React Native app
- [ ] Offline support (PWA)
- [ ] Push notifications
- [ ] QR code expense splitting

### Phase 5: AI Features
- [ ] Smart expense categorization
- [ ] Settlement optimization algorithm
- [ ] Predictive spending
- [ ] Chatbot for expense input

### Phase 6: Enterprise
- [ ] Multi-group support
- [ ] Admin dashboards
- [ ] Role-based access
- [ ] Audit logging
- [ ] SSO integration

## 📊 Scalability Path

### Current (SQLite, 1-20 people)
- Single machine
- No external resources
- Development database

### Phase 1 (20-100 people)
- PostgreSQL database
- Redis caching
- Load balancing needed
- CDN for frontend

### Phase 2 (100-1000 people)
- Database sharding
- Microservices architecture
- Message queues (RabbitMQ/Kafka)
- GraphQL API option

### Phase 3 (1000+ people)
- Distributed systems
- Multi-region deployment
- Real-time updates (WebSockets)
- Advanced caching strategies

## 🔧 Maintenance Checklist

### Weekly
- [ ] Check error logs
- [ ] Monitor database size
- [ ] Review active sessions
- [ ] Backup database

### Monthly
- [ ] Update dependencies
- [ ] Security patches
- [ ] Performance review
- [ ] User feedback
- [ ] Database optimization

### Quarterly
- [ ] Major version updates
- [ ] Disaster recovery test
- [ ] Security audit
- [ ] Usage analytics review
- [ ] Capacity planning

## 🚨 Troubleshooting Common Issues

### Issue: Slow Balance Calculation
**Solution:** Add database indexes
```sql
CREATE INDEX idx_exp_id ON expenses(id);
CREATE INDEX idx_part_exp ON expense_participants(expenseId);
```

### Issue: High Memory Usage
**Solution:** Implement pagination
```javascript
const LIMIT = 50;
const offset = (page - 1) * LIMIT;
db.all('SELECT * FROM expenses LIMIT ? OFFSET ?', [LIMIT, offset]);
```

### Issue: Database Lock Errors
**Solution:** Switch to PostgreSQL and use connection pooling
```javascript
const pool = new Pool({ max: 20, idleTimeoutMillis: 30000 });
```

### Issue: CORS Errors
**Solution:** Update CORS configuration
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

## 📚 Additional Resources

- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [SQLite vs PostgreSQL](https://www.postgresql.org)
- [AWS Deployment Guide](https://docs.aws.amazon.com)
- [Security Best Practices](https://owasp.org)

## 🎓 Learning Path

1. **Basics** - Run locally and understand flow
2. **Customization** - Modify for your needs
3. **Testing** - Add test suite
4. **Deployment** - Deploy to cloud
5. **Enhancement** - Add new features
6. **Scaling** - Multi-tenant support

---

**Deployment support available through documentation!** 📖
