/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  reactStrictMode: true,
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Base CSP configuration
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cnhxgrlexzovtufeeqzd.supabase.co",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://cnhxgrlexzovtufeeqzd.supabase.co",
      "frame-src 'self' https://cnhxgrlexzovtufeeqzd.supabase.co",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'"
    ];

    // Add nonce for production
    const csp = cspDirectives.join('; ');

    return [
      {
        // apply to all routes
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Content-Security-Policy",
            value: csp
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ]
  }
}

module.exports = nextConfig
