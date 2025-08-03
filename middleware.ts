import { NextResponse, NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Paths that require authentication
const protectedPaths = [/^\/admin\/(?!login).*/, /^\/monitor.*/]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = protectedPaths.some((p) => p.test(pathname))
  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get("authToken")?.value
  console.log("Middleware: checking path", pathname, "token present:", !!token)
  if (!token) {
    console.log("Middleware: no token, redirecting to login")
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  let secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      secret = "dev-secret-key"
      console.warn("JWT_SECRET not set in middleware — using dev fallback")
    } else {
      console.error("JWT_SECRET not set")
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  try {
    // jose requires a Uint8Array secret for HS256 verification
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret)) as any
    const role = (payload as any).role as string
    const sub = (payload as any).sub as string

    // RBAC logic
    if (pathname.startsWith("/monitor") && payload.role !== "rd_ard") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
    if (pathname.startsWith("/admin") && payload.role === "rd_ard") {
      return NextResponse.redirect(new URL("/monitor", req.url))
    }

    // Forward request with user info headers (optional)
    const res = NextResponse.next()
    // @ts-ignore payload is any
    res.headers.set("x-user-id", String(payload.sub))
    // @ts-ignore
    res.headers.set("x-user-role", String(payload.role))
    return res
  } catch (err) {
    console.warn("JWT validation failed", err)
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }
}

export const config = {
  matcher: ["/admin/:path*", "/monitor/:path*"],
}
