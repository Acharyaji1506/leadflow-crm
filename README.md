🌐 Frontend: https://leadflow-o8qmphsdj-acharyaji1506s-projects.vercel.app
⚙️ Backend: https://leadflow-crm-backend-0gb7.onrender.com
📦 GitHub: https://github.com/Acharyaji1506/leadflow-crm



# LeadFlow CRM — Lead Management System

A production-grade, full-stack Lead Management CRM built for small businesses. Clean architecture, modern UI, real-time features.

> Inspired by HubSpot, Linear, Notion — but simpler and faster.

---

## 📸 Screenshots

| Dashboard | Leads Table | Kanban Board | Audit Logs |
|-----------|-------------|--------------|------------|
| Stats, charts, funnel | Search, filter, sort | Drag-and-drop stages | Full activity history |

---

## ✨ Features

### Core
- ✅ Create, Read, Update, Delete leads
- ✅ Lead fields: Name, Email, Phone, Company, Status, Notes, Score
- ✅ 5 lead statuses: New → Contacted → Qualified → Converted → Lost

### Dashboard
- ✅ 9 stat cards (Total, New, Contacted, Qualified, Converted, Lost, Conversion Rate, Lost Rate, Avg/Day)
- ✅ Conversion Funnel chart (Recharts)
- ✅ Leads by Status bar chart

### Leads Page
- ✅ Full data table with sortable columns (Name, Date, Status, Score)
- ✅ Debounced global search (Name, Email, Company)
- ✅ Advanced filters: Status, Company, Date Range
- ✅ Server-side pagination
- ✅ CSV Export
- ✅ Undo delete (5-second toast)

### Kanban Board
- ✅ 5-column board matching lead statuses
- ✅ Drag & drop between columns (updates status via API)
- ✅ Lead count per column

### Lead Details Drawer
- ✅ Full lead info panel
- ✅ Smart lead score (visual circular progress)
- ✅ Activity timeline (Created, Updated, Status Changed)
- ✅ Notes display
- ✅ Edit & Delete actions

### Command Palette
- ✅ `Ctrl+K` / `Cmd+K` shortcut
- ✅ Search leads live
- ✅ Add Lead, Toggle Dark Mode
- ✅ Navigate to any page

### Audit Logs
- ✅ Separate audit log collection
- ✅ Logs: LEAD_CREATED, LEAD_UPDATED, STATUS_CHANGED, LEAD_DELETED
- ✅ Timestamped with lead ID and name
- ✅ Paginated listing page

### Smart Lead Scoring
- Company email → +15 pts
- Personal email (Gmail etc.) → +5 pts
- Status Qualified → +20, Converted → +30, Contacted → +10, Lost → -10
- Detailed notes → +10, Has notes → +5
- Company provided → +10
- Clamped 0–100, displayed as Hot / Warm / Cold

### UI/UX
- ✅ Dark / Light mode with system preference + persistence
- ✅ Collapsible sidebar
- ✅ Mobile-responsive (hamburger menu)
- ✅ Framer Motion animations throughout
- ✅ Skeleton loaders for all data-loading states
- ✅ Empty states with CTAs
- ✅ Hover effects, transitions

---

## 🏗️ Architecture

```
Frontend (Next.js 14)          Backend (Express.js)         Database (MongoDB Atlas)
┌──────────────────┐           ┌──────────────────┐         ┌─────────────────┐
│ App Router pages │           │     Routes       │         │  leads          │
│ Client components│ ──HTTP──▶ │   Controllers    │ ──ORM──▶│  auditlogs      │
│ Custom hooks     │           │   Services       │         │                 │
│ Services (fetch) │           │  Repositories    │         └─────────────────┘
└──────────────────┘           └──────────────────┘
```

**Request Flow:** Route → Controller → Service → Repository → MongoDB

---

## 📁 Folder Structure

### Backend
```
crm-backend/
├── src/
│   ├── config/         # DB connection
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic + scoring
│   ├── repositories/   # Database access layer
│   ├── models/         # Mongoose models (Lead, AuditLog)
│   ├── routes/         # Express router
│   ├── middlewares/    # Error handler, not-found
│   ├── validators/     # Zod schemas
│   ├── utils/          # Response helpers, scoring
│   └── __tests__/      # Jest tests
└── render.yaml
```

### Frontend
```
crm-frontend/
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── page.tsx    # Dashboard
│   │   ├── leads/      # Leads management
│   │   ├── kanban/     # Kanban board
│   │   └── audit-logs/ # Audit log viewer
│   ├── components/
│   │   ├── common/     # StatusBadge, LeadScore, Skeleton, EmptyState
│   │   ├── dashboard/  # DashboardStats (charts + cards)
│   │   ├── kanban/     # KanbanBoard (dnd-kit)
│   │   ├── leads/      # LeadTable, LeadForm, LeadModal, LeadDrawer
│   │   └── layout/     # Sidebar, MobileHeader, AppShell, CommandPalette
│   ├── hooks/          # useLeads, useStats
│   ├── services/       # API service (leadsApi, auditLogsApi)
│   ├── types/          # TypeScript interfaces
│   ├── constants/      # STATUS_CONFIG, LEAD_STATUSES, SCORE_TIER
│   └── utils/          # cn(), formatDate(), timeAgo()
└── vercel.json
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the repo
```bash
git clone https://github.com/your-username/leadflow-crm.git
cd leadflow-crm
```

### 2. Backend Setup
```bash
cd crm-backend
cp .env.example .env
# Edit .env — add your MONGO_URI
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd crm-frontend
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open http://localhost:3000

---

## 🔑 Environment Variables

### Backend (`crm-backend/.env`)
| Variable    | Description                     | Example |
|-------------|---------------------------------|---------|
| PORT        | Server port                     | 5000 |
| MONGO_URI   | MongoDB Atlas connection string | `mongodb+srv://...` |
| CLIENT_URL  | Frontend URL for CORS           | `http://localhost:3000` |
| NODE_ENV    | Environment                     | development |

### Frontend (`crm-frontend/.env.local`)
| Variable              | Description              | Example |
|-----------------------|--------------------------|---------|
| NEXT_PUBLIC_API_URL   | Backend API base URL     | `http://localhost:5000/api` |

---

## 🧪 Running Tests

```bash
# Backend (Jest)
cd crm-backend
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode

# Frontend (Vitest)
cd crm-frontend
npm test              # Run all tests
npm run test:ui       # Vitest UI
```

**Backend test coverage:**
- Scoring algorithm (7 tests)
- Zod validators (12 tests)  
- API endpoints integration (leads CRUD, stats, export, health)

**Frontend test coverage:**
- Utility functions (formatDate, timeAgo — 5 tests)
- Form schema validation (8 tests)
- Constants correctness (8 tests)

---

## 📡 API Reference

### Base URL: `/api`

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | /health               | Health check                       |
| POST   | /leads                | Create lead                        |
| GET    | /leads                | Get leads (filter, sort, paginate) |
| GET    | /leads/stats          | Dashboard statistics               |
| GET    | /leads/export/csv     | Export all leads as CSV            |
| GET    | /leads/:id            | Get single lead                    |
| PUT    | /leads/:id            | Update lead                        |
| DELETE | /leads/:id            | Delete lead                        |
| GET    | /audit-logs           | Get paginated audit logs           |
| GET    | /audit-logs/lead/:id  | Get audit logs for a lead          |

### Query Params for GET /leads
```
?page=1&limit=10
&search=john
&status=Qualified
&company=Acme
&startDate=2024-01-01&endDate=2024-12-31
&sortBy=createdAt&sortOrder=desc
```

### Response Format
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1, "limit": 10, "total": 42,
    "totalPages": 5, "hasNext": true, "hasPrev": false
  }
}
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd crm-frontend
npx vercel --prod
# Set env var NEXT_PUBLIC_API_URL = your Render backend URL
```

### Backend → Render
1. Push `crm-backend/` to GitHub
2. New Web Service on Render → connect repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set env vars: `MONGO_URI`, `CLIENT_URL` (your Vercel URL), `NODE_ENV=production`

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Add a database user
3. Whitelist `0.0.0.0/0` in Network Access (or Render's IP)
4. Copy connection string → use as `MONGO_URI`

---

## 🛡️ Security

- **Helmet** — HTTP security headers
- **CORS** — Origin whitelist
- **Rate Limiting** — 200 req/15min global, 30 req/min on leads
- **express-mongo-sanitize** — Prevents NoSQL injection
- **Zod** — Input validation on all endpoints
- **10kb body limit** — Prevents request flooding
- **No secrets in code** — All via env vars

---

## 🔮 Future Improvements

- [ ] Authentication (JWT + refresh tokens)
- [ ] Multi-user with role-based access (Admin / Sales Rep)
- [ ] Email integration (send follow-up emails from CRM)
- [ ] Lead import from CSV
- [ ] Webhook notifications on status change
- [ ] Customizable lead pipelines
- [ ] Charts: lead growth over time (time-series)
- [ ] Mobile app (React Native)

---

## 👨‍💻 Built With

**Frontend:** Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Recharts · dnd-kit · CMDK  
**Backend:** Node.js · Express.js · TypeScript · Mongoose  
**Database:** MongoDB Atlas  
**Testing:** Jest · Vitest · Supertest  
**Deployment:** Vercel · Render

---

Made with ⚡ by LeadFlow
