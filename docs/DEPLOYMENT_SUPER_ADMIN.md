# Super Admin Backend Deployment Guide

## Quick Deployment Steps

### 1. Database Migration

```bash
# Option 1: Via Supabase Dashboard (Recommended)
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of backend/supabase/migrations/001_initial_schema.sql
# 3. Paste and Run

# Option 2: Via Supabase CLI
supabase db push
```

### 2. Set Environment Variables

In Supabase Dashboard → Edge Functions → Settings:

```
SUPABASE_URL=https://kkdnnrwhzofttzajnwlj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
GEMINI_API_KEY=<your_gemini_key>
```

### 3. Deploy Edge Function

```bash
# Using Supabase CLI
supabase functions deploy make-server-6757d0ca

# Or via Dashboard:
# 1. Go to Edge Functions
# 2. Create/Update function: make-server-6757d0ca
# 3. Copy code from backend/supabase-functions/server/index.tsx
# 4. Deploy
```

### 4. Create Super Admin User

```sql
-- After creating user in Supabase Auth, run:
UPDATE users 
SET role = 'superadmin' 
WHERE email = 'your-admin-email@example.com';
```

### 5. Test Deployment

```bash
# Test health endpoint
curl https://kkdnnrwhzofttzajnwlj.supabase.co/functions/v1/make-server-6757d0ca/health

# Should return: {"status":"ok"}
```

## Production Checklist

- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Edge function deployed
- [ ] Super admin user created
- [ ] RLS policies verified
- [ ] API endpoints tested
- [ ] Frontend connected to backend
- [ ] Error logging configured
- [ ] Monitoring set up

## API Endpoints

All endpoints require Bearer token authentication:

- `GET /admin/users` - List all users
- `GET /admin/users/:id` - Get user by ID
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/overview` - System overview stats
- `GET /admin/audit-logs` - Get audit logs
- `GET /admin/billing/stats` - Billing statistics
- `GET /admin/usage` - Usage metrics
- `GET /admin/health` - System health
- `GET /admin/feature-flags` - List feature flags
- `POST /admin/feature-flags` - Create feature flag
- `PUT /admin/feature-flags/:id` - Update feature flag

