"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ParticipantMasterList } from "@/components/participant-master-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Check,
  X,
  Trash2,
  Building2,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  AlertTriangle,
} from "lucide-react"
import {
  getIndividualRegistrations,
  getGroupRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  getRegistrationStats,
  type IndividualRegistrationWithOffice,
  type GroupRegistrationWithOffice,
  type RegistrationStats,
} from "@/lib/registrations"
import { useToast } from "@/hooks/use-toast"

interface FieldOfficeStats {
  id: number
  name: string
  code: string
  individual: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  group: {
    total: number
    pending: number
    approved: number
    rejected: number
    participants: number
  }
  totals: {
    registrations: number
    participants: number
    pending: number
    approved: number
    rejected: number
  }
}

interface MainAdminViewProps {
  fieldOfficeId?: number
  isMainAdmin?: boolean
}

const fieldOffices = [
  { id: 1, code: "cotabato", name: "Cotabato City", color: "from-blue-500 to-blue-600" },
  { id: 21, code: "sulu_station", name: "Sulu Station", color: "from-green-500 to-green-600" },
  { id: 22, code: "basilan_station", name: "Basilan Station", color: "from-teal-500 to-teal-600" },
  { id: 3, code: "lanao", name: "Lanao Del Sur", color: "from-purple-500 to-purple-600" },
  { id: 4, code: "tawi", name: "Tawi-Tawi", color: "from-orange-500 to-orange-600" },
  { id: 5, code: "maguindanao", name: "Maguindanao", color: "from-red-500 to-red-600" },
]

export function MainAdminView({ fieldOfficeId, isMainAdmin = true }: MainAdminViewProps) {
  const [individualRegistrations, setIndividualRegistrations] = useState<IndividualRegistrationWithOffice[]>([])
  const [groupRegistrations, setGroupRegistrations] = useState<GroupRegistrationWithOffice[]>([])
  const [fieldOfficeStats, setFieldOfficeStats] = useState<FieldOfficeStats[]>([])
  const [overallStats, setOverallStats] = useState<RegistrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOffice, setSelectedOffice] = useState<string>("all")
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch overall stats and individual field office stats
      const [overallData, individualData, groupData] = await Promise.all([
        getRegistrationStats(), // Overall stats (no field office filter)
        getIndividualRegistrations(), // All individual registrations
        getGroupRegistrations(), // All group registrations
      ])

      setOverallStats(overallData)
      setIndividualRegistrations(individualData)
      setGroupRegistrations(groupData)

      // Calculate stats for each field office
      const officeStats: FieldOfficeStats[] = await Promise.all(
        fieldOffices.map(async (office) => {
          const stats = await getRegistrationStats(office.id)
          return {
            id: office.id,
            name: office.name,
            code: office.code,
            ...stats,
          }
        }),
      )

      setFieldOfficeStats(officeStats)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch registration data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()

    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchData, 120000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleStatusUpdate = async (id: number, type: "individual" | "group", status: "approved" | "rejected") => {
    try {
      const success = await updateRegistrationStatus(id, status, type)
      if (success) {
        toast({
          title: "Success",
          description: `Registration ${status} successfully`,
        })
        fetchData()
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update registration status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number, type: "individual" | "group") => {
    if (!confirm("Are you sure you want to delete this registration?")) return

    try {
      const success = await deleteRegistration(id, type)
      if (success) {
        toast({
          title: "Success",
          description: "Registration deleted successfully",
        })
        fetchData()
      } else {
        throw new Error("Failed to delete registration")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete registration",
        variant: "destructive",
      })
    }
  }

  const toggleGroupExpansion = (groupId: number) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getOfficeColor = (code: string) => {
    return fieldOffices.find((office) => office.code === code)?.color || "from-gray-500 to-gray-600"
  }

  const filteredIndividualRegistrations = individualRegistrations.filter((reg) => {
    const matchesSearch =
      reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.contact_number?.includes(searchTerm) ||
      reg.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.field_offices?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter
    const matchesOffice = selectedOffice === "all" || reg.field_offices?.code === selectedOffice

    return matchesSearch && matchesStatus && matchesOffice
  })

  const filteredGroupRegistrations = groupRegistrations.filter((reg) => {
    const matchesSearch =
      reg.agency_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.contact_number?.includes(searchTerm) ||
      reg.field_offices?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter
    const matchesOffice = selectedOffice === "all" || reg.field_offices?.code === selectedOffice

    return matchesSearch && matchesStatus && matchesOffice
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
          <span className="text-lg">Loading main admin dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Main Admin Dashboard</h2>
          <p className="text-muted-foreground">Monitor and manage all field office registrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Individual ({filteredIndividualRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="master" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Participants
          </TabsTrigger>
          <TabsTrigger value="group" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Group ({filteredGroupRegistrations.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Overall Statistics */}
          {overallStats && (
            <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
              <Card className="min-w-0 flex-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totals.registrations}</div>
                  <p className="text-xs text-muted-foreground">
                    {overallStats.individual.total} individual + {overallStats.group.total} group
                  </p>
                </CardContent>
              </Card>

              <Card className="min-w-0 flex-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totals.participants}</div>
                  <p className="text-xs text-muted-foreground">Across all field offices</p>
                </CardContent>
              </Card>

              <Card className="min-w-0 flex-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Individual Participants</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.individual.total}</div>
                  <p className="text-xs text-muted-foreground">From individual registrations</p>
                </CardContent>
              </Card>

              <Card className="min-w-0 flex-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{overallStats.totals.pending}</div>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </CardContent>
              </Card>

              <Card className="min-w-0 flex-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {overallStats.totals.registrations > 0
                      ? Math.round((overallStats.totals.approved / overallStats.totals.registrations) * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">{overallStats.totals.approved} approved</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Field Office Performance */}
          <Card className="min-w-0 flex-1">
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
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">{office.totals.rejected}</div>
                        <p className="text-xs text-muted-foreground">Rejected</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">{office.group.participants}</div>
                        <p className="text-xs text-muted-foreground">Group</p>
                      </div>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Approval Progress</span>
                        <span>
                          {office.totals.registrations > 0
                            ? Math.round((office.totals.approved / office.totals.registrations) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          office.totals.registrations > 0
                            ? (office.totals.approved / office.totals.registrations) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    {office.totals.pending > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        {office.totals.pending} registrations need review
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Registration Trends */}
            <Card className="min-w-0 flex-1">
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
                          {overallStats?.totals.participants
                            ? Math.round((office.totals.participants / overallStats.totals.participants) * 100)
                            : 0}
                          %
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Overview */}
            <Card className="min-w-0 flex-1">
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>Current registration status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-600">{overallStats?.totals.approved || 0}</span>
                      <Badge variant="outline" className="text-green-600">
                        {overallStats?.totals.registrations
                          ? Math.round((overallStats.totals.approved / overallStats.totals.registrations) * 100)
                          : 0}
                        %
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-yellow-600">{overallStats?.totals.pending || 0}</span>
                      <Badge variant="outline" className="text-yellow-600">
                        {overallStats?.totals.registrations
                          ? Math.round((overallStats.totals.pending / overallStats.totals.registrations) * 100)
                          : 0}
                        %
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Rejected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-red-600">{overallStats?.totals.rejected || 0}</span>
                      <Badge variant="outline" className="text-red-600">
                        {overallStats?.totals.registrations
                          ? Math.round((overallStats.totals.rejected / overallStats.totals.registrations) * 100)
                          : 0}
                        %
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="min-w-0 flex-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Bulk Approve</span>
                  <span className="text-xs text-muted-foreground">Approve pending registrations</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Download className="h-6 w-6 text-blue-600" />
                  <span>Export Reports</span>
                  <span className="text-xs text-muted-foreground">Generate comprehensive reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Activity className="h-6 w-6 text-purple-600" />
                  <span>System Health</span>
                  <span className="text-xs text-muted-foreground">Monitor system performance</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Registrations Tab */}
        <TabsContent value="individual" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
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

          <Card className="min-w-0 flex-1">
            <CardHeader>
              <CardTitle>Individual Registrations</CardTitle>
              <CardDescription>Manage individual participant registrations across all field offices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Field Office</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIndividualRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{registration.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {registration.gender}, Age {registration.age}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{registration.contact_number}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {registration.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`bg-gradient-to-r ${getOfficeColor(registration.field_offices?.code || "")} text-white border-0`}
                        >
                          {registration.field_offices?.name || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell>{new Date(registration.submitted_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {registration.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(registration.id, "individual", "approved")}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(registration.id, "individual", "rejected")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(registration.id, "individual")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Group Registrations Tab */}
        <TabsContent value="master" className="space-y-6">
          <ParticipantMasterList />
        </TabsContent>

        <TabsContent value="group" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search group registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
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

          <Card className="min-w-0 flex-1">
            <CardHeader>
              <CardTitle>Group Registrations</CardTitle>
              <CardDescription>Manage group organization registrations across all field offices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Field Office</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroupRegistrations.map((registration) => (
                    <>
                      {/* Primary row */}
                      <TableRow key={registration.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleGroupExpansion(registration.id)}>
                              {expandedGroups.has(registration.id) ? "−" : "+"}
                            </Button>
                            {registration.agency_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{registration.contact_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {registration.participant_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`bg-gradient-to-r ${getOfficeColor(registration.field_offices?.code || "")} text-white border-0`}
                          >
                            {registration.field_offices?.name || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>{new Date(registration.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {registration.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(registration.id, "group", "approved")}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(registration.id, "group", "rejected")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleDelete(registration.id, "group")}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded details row */}
                      {expandedGroups.has(registration.id) && (
                        <TableRow key={`${registration.id}-details`} className="bg-gray-50">
                          <TableCell colSpan={7} className="p-4">
                            {registration.group_participants && registration.group_participants.length > 0 ? (
                              <Table className="w-full text-sm">
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>OR #</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {registration.group_participants.map((p, idx) => (
                                    <TableRow key={p.id}>
                                      <TableCell>{idx + 1}</TableCell>
                                      <TableCell>{p.full_name}</TableCell>
                                      <TableCell>{p.age}</TableCell>
                                      <TableCell className="capitalize">{p.gender}</TableCell>
                                      <TableCell>{p.email_address || ""}</TableCell>
                                      <TableCell>{p.or_number || ""}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <p className="text-muted-foreground">No participants found for this group.</p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
