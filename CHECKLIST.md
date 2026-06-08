# CRM Master Checklist

## BACKEND
- [x] Project structure (controllers/services/repositories/models/routes/middlewares/validators/utils/config)
- [ ] MongoDB + Mongoose connection
- [ ] Lead model (name, email, phone, company, status, notes, createdDate, updatedDate, score)
- [ ] AuditLog model
- [ ] Lead repository (CRUD + search + pagination)
- [ ] AuditLog repository
- [ ] Lead service (business logic + scoring)
- [ ] Lead controller
- [ ] AuditLog controller
- [ ] Routes: POST /leads, GET /leads, PUT /leads/:id, DELETE /leads/:id, GET /leads/search
- [ ] GET /api/health
- [ ] GET /api/stats
- [ ] GET /api/export/csv
- [ ] GET /api/audit-logs
- [ ] Zod validation middleware
- [ ] Centralized error handler
- [ ] Helmet, CORS, Rate Limiting
- [ ] Input sanitization
- [ ] Standardized API response format
- [ ] Environment variables (PORT, MONGO_URI, CLIENT_URL)
- [ ] Server-side pagination
- [ ] Activity timeline tracking on lead

## FRONTEND
- [ ] Next.js App Router setup
- [ ] TypeScript + Tailwind + Shadcn
- [ ] Dark mode with persistence
- [ ] Layout with sidebar navigation
- [ ] Dashboard page with stats cards
- [ ] Conversion funnel chart (Recharts)
- [ ] Leads list page with table
- [ ] Kanban board page with drag-and-drop
- [ ] Lead form (create/edit) with React Hook Form + Zod
- [ ] Lead details drawer (score, timeline, notes)
- [ ] Global search (debounced)
- [ ] Command palette (Ctrl+K) with CMDK
- [ ] Advanced filtering (status, company, date range)
- [ ] Sorting (name, date, status)
- [ ] Server-side pagination UI
- [ ] CSV export button
- [ ] Undo delete toast
- [ ] Skeleton loaders
- [ ] Empty states
- [ ] Framer Motion animations
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Lead score visual display
- [ ] Activity timeline in drawer
- [ ] Audit logs page

## TESTS
- [ ] API endpoint tests (Jest/Vitest)
- [ ] Validation logic tests
- [ ] Utility function tests
- [ ] Lead scoring tests

## DEPLOYMENT CONFIG
- [ ] Frontend Vercel config (vercel.json)
- [ ] Backend Render config (render.yaml)
- [ ] .env.example files
- [ ] README.md (complete)
