"use client"

import { useCallback, useEffect, useState, type FC } from "react"
import {
  getRegistrationStats,
  getIndividualRegistrations,
  getGroupRegistrations,
  type RegistrationStats,
  type IndividualRegistrationWithOffice,
  type GroupRegistrationWithOffice,
} from "@/lib/registrations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Image from "next/image"

import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { clearAuth, getStoredAuth } from "@/lib/auth"
import {
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Users,
  LogOut,
  Clock,
  Shield,
  Monitor,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import dynamic from "next/dynamic"
import { ParticipantMasterList } from "@/components/participant-master-list"
import { LiveStats } from "@/components/live-stats"
import { supabase } from "@/lib/supabase/client"

// Lazy-load chart components only on client side (they rely on window)
interface ChartProps {
  individual: IndividualRegistrationWithOffice[]
  group: GroupRegistrationWithOffice[]
}

const StatusPieChart = dynamic(() => import("./charts/status-pie-chart"), {
  ssr: false,
}) as FC<ChartProps>

const OfficeBarChart = dynamic(() => import("./charts/office-bar-chart"), {
  ssr: false,
}) as FC<ChartProps>

interface FieldOfficeStats extends RegistrationStats {
  id: number
  name: string
  code: string
}

const fieldOffices = [
  { id: 1, code: "cotabato", name: "Cotabato City", color: "from-blue-500 to-blue-600" },
  { id: 21, code: "sulu_station", name: "Sulu Station", color: "from-green-500 to-green-600" },
  { id: 22, code: "basilan_station", name: "Basilan Station", color: "from-teal-500 to-teal-600" },
  { id: 3, code: "lanao", name: "Lanao Del Sur", color: "from-purple-500 to-purple-600" },
  { id: 4, code: "tawi", name: "Tawi-Tawi", color: "from-orange-500 to-orange-600" },
  { id: 5, code: "maguindanao", name: "Maguindanao", color: "from-red-500 to-red-600" },
]

const getOfficeColor = (code: string) => {
  return fieldOffices.find((office) => office.code === code)?.color || "from-gray-500 to-gray-600"
}

export function RdArdDashboard() {
  const [individualRegistrations, setIndividualRegistrations] = useState<IndividualRegistrationWithOffice[]>([])
  const [groupRegistrations, setGroupRegistrations] = useState<GroupRegistrationWithOffice[]>([])
  const [fieldOfficeStats, setFieldOfficeStats] = useState<FieldOfficeStats[]>([])
  const [overallStats, setOverallStats] = useState<RegistrationStats | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOffice, setSelectedOffice] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(getStoredAuth())
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    toast({
      title: "Logged out successfully",
      description: "You have been safely logged out of the system.",
    })
    router.push("/")
  }

  const loginTime = new Date().toLocaleString()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [overall, individuals, groups] = await Promise.all([
        getRegistrationStats(),
        getIndividualRegistrations(),
        getGroupRegistrations(),
      ])
      setOverallStats(overall)

      setIndividualRegistrations(individuals)
      setGroupRegistrations(groups)

      // Fetch stats for each field office
      const officeStats: FieldOfficeStats[] = await Promise.all(
        fieldOffices.map(async (office) => {
          const stats = await getRegistrationStats(office.id)
          return { id: office.id, name: office.name, code: office.code, ...stats }
        }),
      )
      setFieldOfficeStats(officeStats)
    } catch (error) {
      console.error("Error fetching RD/ARD data", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // realtime updates via Supabase
  useEffect(() => {
    const channel = supabase
      .channel("rd-ard-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "individual_registrations" },
        () => fetchData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_registrations" },
        () => fetchData(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 space-x-3">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-lg">Loading RD/ARD dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/csc-logo.png"
                alt="CSC Logo"
                width={48}
                height={48}
                className="rounded-lg shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RD/ARD Monitoring Dashboard</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-gray-600">Read-only overview of all field office applications</p>
                  <Badge variant="default" className="bg-gradient-to-r from-cyan-500 to-cyan-600">
                    <Shield className="h-3 w-3 mr-1" />
                    RD/ARD Monitor
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <Image
                src="/125th%20PCSA%20logo.png"
                alt="125th PCSA Logo"
                width={240}
                height={80}
                className="h-16 w-60 object-contain"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{admin?.name || 'RD/ARD Monitor'}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Logged in: {loginTime}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData} className="mr-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold">
                  {admin?.name?.charAt(0).toUpperCase() || 'R'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-12 bg-white shadow-sm">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                <PieChart className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="individual"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                <Building2 className="h-4 w-4" />
                Group
              </TabsTrigger>
              <TabsTrigger
                value="master"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                Master List
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <> 
                <LiveStats isMainAdmin={true} />

                {/* Field Office Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Field Office Performance
                    </CardTitle>
                    <CardDescription>Registration statistics by field office</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fieldOfficeStats.map((office) => (
                        <div key={office.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 bg-gradient-to-r ${getOfficeColor(office.code)} rounded-lg flex items-center justify-center`}
                              >
                                <Building2 className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{office.name}</h3>
                                <p className="text-sm text-muted-foreground">FO - {office.code}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{office.totals.participants}</div>
                              <p className="text-xs text-muted-foreground">participants</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3 w-full">
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm min-w-0 flex flex-col items-center justify-center p-4">
                              <div className="text-lg font-semibold text-blue-600">{office.individual.total}</div>
                              <p className="text-xs text-muted-foreground">Individual Participants</p>
                            </div>
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm min-w-0 flex flex-col items-center justify-center p-4">
                              <div className="text-lg font-semibold text-purple-600">{office.group.participants}</div>
                              <p className="text-xs text-muted-foreground">Group Participants</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-semibold">{office.totals.registrations}</div>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-yellow-600">{office.totals.pending}</div>
                              <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">{office.totals.approved}</div>
                              <p className="text-xs text-muted-foreground">Approved</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* KPI Summary */}
              {overallStats && (
                <div className="grid gap-4 w-full grid-cols-2 md:grid-cols-4">
                  <Card className="min-w-0 flex-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overallStats.totals.registrations}</div>
                    </CardContent>
                  </Card>
                  <Card className="min-w-0 flex-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Approved</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{overallStats.totals.approved}</div>
                    </CardContent>
                  </Card>
                  <Card className="min-w-0 flex-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{overallStats.totals.pending}</div>
                    </CardContent>
                  </Card>
                  <Card className="min-w-0 flex-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{overallStats.totals.rejected}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Distribution</CardTitle>
                    <CardDescription>Breakdown by field office</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {fieldOfficeStats.map((office) => (
                        <div key={office.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 bg-gradient-to-r ${getOfficeColor(office.code)} rounded`}></div>
                            <span className="font-medium">{office.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{office.totals.participants} participants</span>
                            <Badge variant="outline">
                              {overallStats?.totals.participants ? Math.round((office.totals.participants / overallStats.totals.participants) * 100) : 0}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Registrations per Field Office</CardTitle>
                    <CardDescription>Distribution of registrations across offices</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <OfficeBarChart individual={individualRegistrations} group={groupRegistrations} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Individual Tab */}
            <TabsContent value="individual" className="space-y-4">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search individual registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by office" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Field Offices</SelectItem>
                    {fieldOffices.map((office) => (
                      <SelectItem key={office.code} value={office.code}>
                        {office.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Individual Registrations</CardTitle>
                  <CardDescription>All individual registrations across field offices</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {individualRegistrations
                        .filter((reg) => {
                          const matchesSearch =
                            reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reg.contact_number?.includes(searchTerm)
                          const matchesStatus = statusFilter === "all" || reg.status === statusFilter
                          const matchesOffice = selectedOffice === "all" || reg.field_offices?.code === selectedOffice
                          return matchesSearch && matchesStatus && matchesOffice
                        })
                        .map((registration) => (
                          <TableRow key={registration.id}>
                            <TableCell className="font-medium">{registration.full_name}</TableCell>
                            <TableCell>{registration.contact_number}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`bg-gradient-to-r ${getOfficeColor(registration.field_offices?.code || "")} text-white border-0`}
                              >
                                {registration.field_offices?.name || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>{registration.status}</TableCell>
                            <TableCell>{new Date(registration.submitted_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Group Tab */}
            <TabsContent value="group" className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search group registrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by office" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Field Offices</SelectItem>
                    {fieldOffices.map((office) => (
                      <SelectItem key={office.code} value={office.code}>
                        {office.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Group Registrations</CardTitle>
                  <CardDescription>All group registrations across field offices</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupRegistrations
                        .filter((reg) => {
                          const matchesSearch =
                            reg.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reg.contact_number?.includes(searchTerm)
                          const matchesStatus = statusFilter === "all" || reg.status === statusFilter
                          const matchesOffice = selectedOffice === "all" || reg.field_offices?.code === selectedOffice
                          return matchesSearch && matchesStatus && matchesOffice
                        })
                        .map((registration) => (
                          <TableRow key={registration.id}>
                            <TableCell className="font-medium">{registration.agency_name}</TableCell>
                            <TableCell>{registration.participant_count}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`bg-gradient-to-r ${getOfficeColor(registration.field_offices?.code || "")} text-white border-0`}
                              >
                                {registration.field_offices?.name || "Unknown"}
                              </Badge>
                            </TableCell>
                            <TableCell>{registration.status}</TableCell>
                            <TableCell>{new Date(registration.submitted_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Master List Tab */}
            <TabsContent value="master" className="space-y-6">
              <ParticipantMasterList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
