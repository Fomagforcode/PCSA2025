"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Download,
  Users,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
} from "lucide-react"
import { downloadCSV } from "@/lib/export-utils"
import {
  getIndividualRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  type IndividualRegistrationWithOffice,
} from "@/lib/registrations"

interface IndividualRegistrationsProps {
  fieldOfficeId: number
  isMainAdmin?: boolean
}

export function IndividualRegistrations({ fieldOfficeId, isMainAdmin = false }: IndividualRegistrationsProps) {
  const [registrations, setRegistrations] = useState<IndividualRegistrationWithOffice[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<IndividualRegistrationWithOffice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRegistration, setSelectedRegistration] = useState<IndividualRegistrationWithOffice | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)
  const { toast } = useToast()

  // OR Number approval modal state
  const [orDialogOpen, setOrDialogOpen] = useState(false)
  const [orNumber, setOrNumber] = useState("")
  const [pendingApproveId, setPendingApproveId] = useState<number | null>(null)

  const loadRegistrations = async () => {
    try {
      setLoading(true)
      const data = await getIndividualRegistrations(isMainAdmin ? undefined : fieldOfficeId)
      setRegistrations(data)
      setFilteredRegistrations(data)
    } catch (error) {
      console.error("Error loading registrations:", error)
      toast({
        title: "Error loading data",
        description: "Failed to load individual registrations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRegistrations()
  }, [fieldOfficeId, isMainAdmin])

  useEffect(() => {
    let filtered = registrations

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.contact_number.includes(searchTerm) ||
          reg.address.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((reg) => reg.status === statusFilter)
    }

    setFilteredRegistrations(filtered)
  }, [registrations, searchTerm, statusFilter])

  const handleStatusUpdate = async (id: number, newStatus: "pending" | "approved" | "rejected") => {
    try {
      setUpdating(id)
      let orNum: string | undefined = undefined
      if (newStatus === "approved") {
        // open modal instead of immediate approval
        setPendingApproveId(id)
        setOrDialogOpen(true)
        setUpdating(null)
        return
      }
      // for pending or rejected, no OR number needed

      const success = await updateRegistrationStatus(id, newStatus, "individual", orNum)

      if (success) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === id ? { ...reg, status: newStatus, or_number: orNum } : reg,
          ),
        )
        toast({
          title: "Status updated",
          description: `Registration status changed to ${newStatus}`,
        })
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update registration status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating status",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  // confirm approval from modal
  const confirmApprove = async () => {
    if (!/^\d{8}$/.test(orNumber)) {
      toast({ title: "Invalid OR Number", description: "Please enter exactly 8 digits.", variant: "destructive" })
      return
    }
    if (pendingApproveId == null) return

    setUpdating(pendingApproveId)
    const success = await updateRegistrationStatus(pendingApproveId, "approved", "individual", orNumber)
    if (success) {
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === pendingApproveId ? { ...reg, status: "approved", or_number: orNumber } : reg,
        ),
      )
      toast({ title: "Status updated", description: "Registration approved" })
    } else {
      toast({ title: "Update failed", description: "Failed to update registration status", variant: "destructive" })
    }
    setUpdating(null)
    setPendingApproveId(null)
    setOrNumber("")
    setOrDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this registration?")) return

    try {
      const success = await deleteRegistration(id, "individual")

      if (success) {
        setRegistrations((prev) => prev.filter((reg) => reg.id !== id))
        toast({
          title: "Registration deleted",
          description: "The registration has been removed",
        })
      } else {
        toast({
          title: "Delete failed",
          description: "Failed to delete registration",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting",
        variant: "destructive",
      })
    }
  }

  const handleViewReceipt = (receiptUrl: string | null | undefined) => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank")
    } else {
      toast({
        title: "No receipt available",
        description: "This registration doesn't have a receipt uploaded.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      case "pending":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  // Export CSV
  const handleExport = () => {
    if (filteredRegistrations.length === 0) {
      toast({ title: "No data to export", description: "There are no registrations to export." })
      return
    }
    const rows = filteredRegistrations.map((r) => ({
      ID: r.id,
      Name: r.full_name,
      Age: r.age,
      Gender: r.gender,
      Contact: r.contact_number,
      Address: r.address,
      Status: r.status,
      "Field Office": r.field_offices?.name || "",
    }))
    downloadCSV(`individual_registrations_${Date.now()}.csv`, rows)
  }

  const stats = {
    total: registrations.length,
    male: registrations.filter((r) => r.gender.toLowerCase() === "male").length,
    female: registrations.filter((r) => r.gender.toLowerCase() === "female").length,
    
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,

  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span>Loading individual registrations...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Male</p>
                <p className="text-2xl font-bold text-blue-600">{stats.male}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">M</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Female</p>
                <p className="text-2xl font-bold text-pink-600">{stats.female}</p>
              </div>
              <div className="h-8 w-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600 font-bold text-sm">F</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Individual Registrations ({filteredRegistrations.length})
              </CardTitle>
              <CardDescription>Manage individual participant registrations for Funrun 2025</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadRegistrations} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, contact, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Registrations List */}
          <div className="space-y-4">
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "No registrations found matching your filters."
                  : "No individual registrations yet."}
              </div>
            ) : (
              filteredRegistrations.map((registration) => (
                <Card key={registration.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{registration.full_name}</h3>
                          <Badge variant={registration.gender === "Male" ? "default" : "secondary"}>
                            {registration.gender}
                          </Badge>
                          <Badge variant="outline">Age {registration.age}</Badge>
                          {getStatusBadge(registration.status)}
                          {isMainAdmin && registration.field_offices && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              {registration.field_offices.name}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Contact:</span> {registration.contact_number}
                          </p>
                          <p>
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(registration.submitted_at).toLocaleString()}
                          </p>
                          <p className="md:col-span-2">
                            <span className="font-medium">Address:</span> {registration.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Status Update */}
                        <Select
                          value={registration.status}
                          onValueChange={(value) =>
                            handleStatusUpdate(registration.id, value as "pending" | "approved" | "rejected")
                          }
                          disabled={updating === registration.id}
                        >
                          <SelectTrigger className="w-32">
                            {updating === registration.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              getStatusIcon(registration.status)
                            )}
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRegistration(registration)
                              setViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReceipt(registration.receipt_url ?? null)}
                            disabled={!registration.receipt_url}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(registration.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="font-medium">{selectedRegistration.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Age</label>
                  <p>{selectedRegistration.age} years old</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <p>{selectedRegistration.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <p>{selectedRegistration.contact_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <p>{selectedRegistration.email_address}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p>{selectedRegistration.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRegistration.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Submitted</label>
                  <p>{new Date(selectedRegistration.submitted_at).toLocaleString()}</p>
                </div>
                {selectedRegistration.field_offices && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Field Office</label>
                    <p>{selectedRegistration.field_offices.name}</p>
                  </div>
                )}
                {selectedRegistration.receipt_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Receipt</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReceipt(selectedRegistration.receipt_url ?? null)}
                      className="mt-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* OR Number Approval Dialog */}
      <Dialog open={orDialogOpen} onOpenChange={(open)=>{ if(!open){ setOrDialogOpen(false); setOrNumber(""); setPendingApproveId(null);} }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter OR Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="8-digit OR Number"
              value={orNumber}
              onChange={(e) => setOrNumber(e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={8}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={()=>{ setOrDialogOpen(false); setOrNumber(""); setPendingApproveId(null)}}>
                Cancel
              </Button>
              <Button onClick={confirmApprove} disabled={!/^\d{8}$/.test(orNumber) || updating!==null}>
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
