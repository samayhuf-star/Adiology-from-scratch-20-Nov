# New Adiology- Build Campaign Dashboard


## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Output will be in the `build/` directory
```

## Deployment

### Deploy to Vercel

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

**Quick Steps:**
1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Configure environment variables (see `.env.example`)
4. Deploy

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed information about the organized folder structure.

**Quick Overview:**
- `/docs/` - All documentation files
- `/src/` - Frontend source code
- `/backend/` - Backend/server code (Supabase functions)
- `/scripts/` - Deployment and test scripts
- Root - Configuration files (vite.config.ts, package.json, etc.)

## Documentation

- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Project folder structure and organization
- **[AUDIT_REPORT.md](./AUDIT_REPORT.md)** - Comprehensive audit findings
- **[AUDIT_SUMMARY.md](./AUDIT_SUMMARY.md)** - Quick reference summary
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md)** - Database schema documentation

## Features

- ✅ Campaign Builder
- ✅ Keyword Planner (AI-powered)
- ✅ Keyword Mixer
- ✅ Ads Builder (AI-powered)
- ✅ Negative Keywords Builder
- ✅ CSV Validator
- ✅ History Panel
- ✅ Billing Panel (mock)
- ✅ Support Tickets
- ✅ Super Admin Panel

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_SUPABASE_URL=https://kkdnnrwhzofttzajnwlj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_key_here
```

## Super Admin Access

Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac) to access Super Admin panel.

**Default Credentials:**
- Email: `admin@adbuilder.com`
- Password: `SuperAdmin123!`

## Known Limitations

⚠️ **Before Production:**
- Billing is mock-only (needs Stripe integration)
- No authentication system (needs Supabase Auth)
- Database tables need to be created
- RLS policies need to be configured

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for full details.

## Support

For issues or questions, see the audit reports or create a support ticket in the app.

---

**Last Updated:** 2025-01-27
