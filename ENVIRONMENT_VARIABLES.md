# Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file for local development or to your deployment platform (Cloudflare Pages, Vercel, etc.):

### Core Application
```bash
# Database
DATABASE_URL=your_supabase_database_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### core Application
```bash
# Database
DATABASE_URL=your_supabase_database_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Optional Services
```bash
# Google Site Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
```

## Performance Notes

This ecommerce template is optimized for performance:

- **Optimized Rendering**: Uses Next.js Server Components for fast initial loads.
- **Efficient Styling**: Tailwind CSS ensures minimal CSS bundle size.

## Production Deployment

When deploying to production:

1. Update `NEXT_PUBLIC_SITE_URL` to your actual domain.
2. Ensure all environment variables are set in your hosting platform.
3. Configure your `siteConfig` in `src/config/site.ts` with your brand details.