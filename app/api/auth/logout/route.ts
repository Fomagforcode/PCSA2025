import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  cookies().delete("authToken")
  return NextResponse.json({}, { status: 204 })
}
