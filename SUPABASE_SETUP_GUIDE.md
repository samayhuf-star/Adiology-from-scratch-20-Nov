# Supabase Setup Guide for CampaignBuilder3

## Dashboard URL
https://supabase.com/dashboard/project/kkdnnrwhzofttzajnwlj/

## Step-by-Step Verification & Setup

### 1. Check Database Tables

**Navigate to:** Database → Tables

**What to check:**
- ✅ Does `campaign_history` table exist?
- ✅ Does it have the correct columns?

**If table doesn't exist:**
1. Go to **SQL Editor** in the dashboard
2. Copy the contents of `supabase/migrations/20250103000000_create_campaign_history.sql`
3. Paste and run the SQL
4. Verify the table was created

### 2. Check Edge Functions

**Navigate to:** Edge Functions

**What to check:**
- ✅ Is `make-server-6757d0ca` function deployed?
- ✅ What's its status (Active/Inactive)?

**If function is NOT deployed:**
1. In the dashboard, go to **Edge Functions**
2. Click **Deploy** or use CLI:
   ```bash
   supabase functions deploy make-server-6757d0ca
   ```

### 3. Check Row Level Security (RLS)

**Navigate to:** Database → Tables → campaign_history → Policies

**What to check:**
- ✅ Are RLS policies enabled?
- ✅ Do policies allow users to read/write their own campaigns?

**Expected policies:**
- `Users can view their own campaigns` (SELECT)
- `Users can insert their own campaigns` (INSERT)
- `Users can update their own campaigns` (UPDATE)
- `Users can delete their own campaigns` (DELETE)

### 4. Test Database Connection

**Navigate to:** SQL Editor

**Run this query:**
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'campaign_history'
);

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'campaign_history'
ORDER BY ordinal_position;
```

### 5. Test Edge Function

**Navigate to:** Edge Functions → make-server-6757d0ca → Logs

**Or test via API:**
```bash
curl -X GET "https://kkdnnrwhzofttzajnwlj.supabase.co/functions/v1/make-server-6757d0ca/health" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Expected response:**
```json
{"status":"ok"}
```

## Current Status Checklist

### Database Setup
- [ ] `campaign_history` table created
- [ ] RLS policies configured
- [ ] Indexes created
- [ ] Triggers set up (for updated_at)

### Edge Function
- [ ] Function deployed
- [ ] Environment variables set (GEMINI_API_KEY, etc.)
- [ ] Function is active

### Connection Test
- [ ] Can connect to database
- [ ] Can save campaigns
- [ ] Can retrieve campaigns
- [ ] Fallback to localStorage works if database fails

## Quick Setup Commands

### Option 1: Using Supabase Dashboard

1. **Create Table:**
   - Go to SQL Editor
   - Run: `supabase/migrations/20250103000000_create_campaign_history.sql`

2. **Deploy Function (if needed):**
   - Go to Edge Functions
   - Click Deploy for `make-server-6757d0ca`

### Option 2: Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref kkdnnrwhzofttzajnwlj

# Run migrations
supabase db push

# Deploy edge function
supabase functions deploy make-server-6757d0ca
```

## Verification Script

Run the verification script to check everything:

```bash
# Using Deno
deno run --allow-net --allow-env scripts/check-supabase-connection.ts

# Or using the bash script
./scripts/verify-backend-deployment.sh
```

## Troubleshooting

### Issue: Table doesn't exist
**Solution:** Run the migration SQL in Supabase SQL Editor

### Issue: Edge function returns 404
**Solution:** Deploy the edge function from the dashboard or CLI

### Issue: RLS blocking access
**Solution:** Check that RLS policies are correctly set up in the migration

### Issue: Can't save campaigns
**Solution:** 
1. Check browser console for errors
2. Verify table exists
3. Check RLS policies
4. Test direct database connection

## Expected Behavior

### When Everything Works:
1. Campaign saves to database via edge function (if deployed)
2. Or saves directly to database (if edge function not deployed)
3. Campaign appears in database table
4. Campaign retrievable on next visit

### When Database Fails:
1. Falls back to localStorage
2. Campaign still saved (but only in browser)
3. Console shows: "Saved to local storage"

## Next Steps After Setup

1. ✅ Run the migration SQL
2. ✅ Test saving a campaign
3. ✅ Verify campaign appears in database
4. ✅ Test retrieving campaigns
5. ✅ (Optional) Deploy edge function

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs (Edge Functions → Logs)
3. Verify database connection in SQL Editor
4. Test with the verification scripts

