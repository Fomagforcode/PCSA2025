"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Clock, XCircle, Building2, FileText, TrendingUp, TrendingDown } from "lucide-react"
import { getRegistrationStats, type RegistrationStats } from "@/lib/registrations"

interface LiveStatsProps {
  fieldOfficeId?: number
  isMainAdmin?: boolean
}

export function LiveStats({ fieldOfficeId, isMainAdmin = false }: LiveStatsProps) {
  const [stats, setStats] = useState<RegistrationStats>({
    individual: { total: 0, pending: 0, approved: 0, rejected: 0 },
    group: { total: 0, pending: 0, approved: 0, rejected: 0, participants: 0 },
    totals: { registrations: 0, participants: 0, pending: 0, approved: 0, rejected: 0 },
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const data = await getRegistrationStats(fieldOfficeId)
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }, [fieldOfficeId])

  useEffect(() => {
    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) {
    return (
      <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="min-w-0 flex-1">
            <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
              <div className="p-1 pt-0 h-20 bg-gray-200 rounded animate-pulse" />
              <div className="p-1 pt-0 h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="p-1">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
      {/* Total Registrations */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
          <FileText className="p-1 pt-0 h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold">{stats.totals.registrations}</div>
          <p className="text-xs text-muted-foreground">
            {stats.individual.total} individual + {stats.group.total} group
          </p>
        </CardContent>
      </Card>

      {/* Total Participants */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          <Users className="p-1 pt-0 h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold">{stats.totals.participants}</div>
          <p className="text-xs text-muted-foreground">
            {stats.individual.total} individual + {stats.group.participants} group
          </p>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <Clock className="p-1 pt-0 h-6 w-6 text-yellow-600" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold text-yellow-600">{stats.totals.pending}</div>
          <p className="text-xs text-muted-foreground">
            {stats.individual.pending} individual + {stats.group.pending} group
          </p>
        </CardContent>
      </Card>

      {/* Approved */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
          <UserCheck className="p-1 pt-0 h-6 w-6 text-green-600" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold text-green-600">{stats.totals.approved}</div>
          <p className="text-xs text-muted-foreground">
            {stats.individual.approved} individual + {stats.group.approved} group
          </p>
        </CardContent>
      </Card>

      {/* Rejected */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          <XCircle className="p-1 pt-0 h-6 w-6 text-red-600" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold text-red-600">{stats.totals.rejected}</div>
          <p className="text-xs text-muted-foreground">
            {stats.individual.rejected} individual + {stats.group.rejected} group
          </p>
        </CardContent>
      </Card>

      {/* Individual Participants */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Individual Participants</CardTitle>
          <Users className="p-1 pt-0 h-6 w-6 text-blue-600" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold text-blue-600">{stats.individual.total}</div>
          <p className="text-xs text-muted-foreground">From individual registrations</p>
        </CardContent>
      </Card>

      {/* Group Participants */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Group Participants</CardTitle>
          <Building2 className="p-1 pt-0 h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold">{stats.group.participants}</div>
          <p className="text-xs text-muted-foreground">From {stats.group.total} group registrations</p>
        </CardContent>
      </Card>

      {/* Pending % */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Pending %</CardTitle>
          <Clock className="p-1 pt-0 h-6 w-6 text-yellow-600" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.totals.registrations ? ((stats.totals.pending / stats.totals.registrations) * 100).toFixed(0) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">{stats.totals.pending} pending</p>
        </CardContent>
      </Card>

      {/* Approval Rate */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          <TrendingUp className="p-1 pt-0 h-6 w-6 text-green-600" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold text-green-600">
            {stats.totals.registrations ? ((stats.totals.approved / stats.totals.registrations) * 100).toFixed(0) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">{stats.totals.approved} approved</p>
        </CardContent>
      </Card>

      {/* Rejection Rate */}
      <Card className="min-w-0 flex-1">
        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
          <TrendingDown className="p-1 pt-0 h-6 w-6 text-red-600" />
        </CardHeader>
        <CardContent className="p-1">
          <div className="text-2xl font-bold text-red-600">
            {stats.totals.registrations ? ((stats.totals.rejected / stats.totals.registrations) * 100).toFixed(0) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">{stats.totals.rejected} rejected</p>
        </CardContent>
      </Card>
    </div>
  )
}
