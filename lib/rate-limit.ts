import { RateLimiterMemory } from "rate-limiter-flexible"
import { NextRequest, NextResponse } from "next/server"

// 100 requests per 15 minutes per IP as default
const limiter = new RateLimiterMemory({ points: 100, duration: 900 })

export async function rateLimit(req: NextRequest): Promise<NextResponse | void> {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown"
  try {
    await limiter.consume(ip)
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
}
