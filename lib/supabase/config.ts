// DEV-ONLY fallback: load .env.local if vars missing (no effect in prod)
// DEV-ONLY fallback: attempt to load env vars from .env.local or .env using absolute path
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path');
  const dotenv = require('dotenv');
  const root = process.cwd();
  const tried = [
    path.join(root, '.env.local'),
    path.join(root, '.env')
  ];
  for (const p of tried) {
    const result = dotenv.config({ path: p });
    if (result.parsed) {
      // eslint-disable-next-line no-console
      console.log(`Loaded env vars from ${p}`);
      break;
    }
  }
}

// Supabase credentials are provided via environment variables.
// NEXT_PUBLIC_* variables are exposed to the browser; keep service-role keys server-side only.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}
