export const runtime = "nodejs"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { loginSchema } from "@/lib/validators"
import { authenticateAdmin } from "@/lib/auth"
import { RateLimiterMemory } from "rate-limiter-flexible"

const limiter = new RateLimiterMemory({ points: 10, duration: 60 }) // 10 requests per minute per IP

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown"
  try {
    await limiter.consume(ip)
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const body = await req.json()
  const parse = loginSchema.safeParse(body)
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  const { username, password } = parse.data

  const user = await authenticateAdmin(username, password)
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
  console.log("JWT_SECRET value:", process.env.JWT_SECRET);
  let secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      // Fallback for development so dev login works even without .env
      secret = "dev-secret-key"
      console.warn("JWT_SECRET not set — using insecure dev-secret-key")
    } else {
      console.error("JWT_SECRET env missing")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }
  }
  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      fieldOfficeId: user.fieldOfficeId,
    },
    secret,
    { expiresIn: "15m" },
  )

  const response = NextResponse.json({ user: { name: user.name, role: user.role, fieldOffice: user.fieldOfficeName, fieldOfficeId: user.fieldOfficeId } })
  response.cookies.set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 15,
    path: "/",
  })
  return response
}
