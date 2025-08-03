"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import { getStoredAuth, type AdminUser } from "@/lib/auth"

export default function DashboardPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedAdmin = getStoredAuth()
        if (!storedAdmin) {
          router.push("/admin/login")
          return
        }
        setAdmin(storedAdmin)
      } catch (error) {
        console.error("Authentication error:", error)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null // Will redirect to login
  }

  return <AdminDashboard authData={admin} />
}
