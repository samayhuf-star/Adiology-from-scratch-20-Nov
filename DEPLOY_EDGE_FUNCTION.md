# Deploy Edge Function for Email Testing

The Edge Function needs to be deployed to Supabase before testing email functionality.

## Quick Deploy Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/kkdnnrwhzofttzajnwlj
   - Navigate to: **Edge Functions**

2. **Create/Update Function**
   - Click **Create Function** (or find `make-server-6757d0ca` if it exists)
   - Function name: `make-server-6757d0ca`
   - Copy the code from: `supabase/functions/make-server-6757d0ca/index.tsx`

3. **Set Environment Variables (Secrets)**
   - Go to **Project Settings** → **Edge Functions** → **Secrets**
   - Add these secrets:
     ```
     POSTMARK_API_KEY=bc9029fb-e5a1-45b9-a94e-11ee31e23a68
     POSTMARK_FROM_EMAIL=noreply@adiology.online
     FRONTEND_URL=https://adiology.online
     ```
   - **Note**: Replace `noreply@adiology.online` with your verified Postmark sender email

4. **Deploy**
   - Click **Deploy** button
   - Wait for deployment to complete

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref kkdnnrwhzofttzajnwlj

# Set secrets
supabase secrets set POSTMARK_API_KEY=bc9029fb-e5a1-45b9-a94e-11ee31e23a68
supabase secrets set POSTMARK_FROM_EMAIL=noreply@adiology.online
supabase secrets set FRONTEND_URL=https://adiology.online

# Deploy the function
supabase functions deploy make-server-6757d0ca --no-verify-jwt
```

### Option 3: Using the Deploy Script

```bash
# Make script executable
chmod +x scripts/deploy-edge-function.sh

# Run deployment script
./scripts/deploy-edge-function.sh
```

## Verify Deployment

After deploying, test the health endpoint:

```bash
curl https://kkdnnrwhzofttzajnwlj.supabase.co/functions/v1/make-server-6757d0ca/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM"
```

Expected response: `{"status":"ok"}`

## After Deployment

Once deployed, you can test email functionality:

```bash
node scripts/test-postmark-setup.js your-email@example.com
```

## Troubleshooting

### "Project not specified" Error
- Edge Function is not deployed
- Deploy using one of the methods above

### Function Not Found
- Check function name matches exactly: `make-server-6757d0ca`
- Verify function exists in Supabase Dashboard

### Environment Variables Not Working
- Secrets must be set in Supabase Dashboard → Project Settings → Edge Functions → Secrets
- Redeploy function after setting secrets
- Variable names are case-sensitive

