"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Download,
  FileSpreadsheet,
  Receipt,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Users,
  Upload,
} from "lucide-react"
import { downloadCSV } from "@/lib/export-utils"
import {
  getGroupRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  submitGroupRegistration,
  type GroupRegistrationWithOffice,
} from "@/lib/registrations"
import { ExcelTemplateManager } from "./excel-template-manager"
import type { GroupRegistrationTemplate } from "@/lib/excel-template"

interface GroupRegistrationProps {
  fieldOfficeId: number
  isMainAdmin?: boolean
}

export function GroupRegistration({ fieldOfficeId, isMainAdmin = false }: GroupRegistrationProps) {
  const [registrations, setRegistrations] = useState<GroupRegistrationWithOffice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<GroupRegistrationWithOffice | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false)
  const [updating, setUpdating] = useState<number | null>(null)
  const [showNewRegistrationForm, setShowNewRegistrationForm] = useState(false)
  const { toast } = useToast()

  // OR Number approval modal state
  const [orDialogOpen, setOrDialogOpen] = useState(false)
  const [orNumber, setOrNumber] = useState("")
  const [pendingApproveId, setPendingApproveId] = useState<number | null>(null)

  // New registration form state
  const [formData, setFormData] = useState({
    agencyName: "",
    contactNumber: "",
    excelFile: null as File | null,
    receiptFile: null as File | null,
    templateData: null as GroupRegistrationTemplate | null,
  })
  const [submitting, setSubmitting] = useState(false)

  const loadRegistrations = async () => {
    try {
      setLoading(true)
      const data = await getGroupRegistrations(fieldOfficeId)
      setRegistrations(data)
    } catch (error) {
      console.error("Error loading group registrations:", error)
      toast({
        title: "Error loading data",
        description: "Failed to load group registrations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRegistrations()
  }, [fieldOfficeId, isMainAdmin])

  const handleStatusUpdate = async (
    id: number,
    newStatus: "pending" | "approved" | "rejected",
  ) => {
    try {
      setUpdating(id)
      let orNum: string | undefined = undefined
      if (newStatus === "approved") {
        setPendingApproveId(id)
        setOrDialogOpen(true)
        setUpdating(null)
        return
      }
      const success = await updateRegistrationStatus(id, newStatus, "group", orNum)

      if (success) {
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.id === id ? { ...reg, status: newStatus } : reg,
          ),
        )
        toast({
          title: "Status updated",
          description: `Group registration status changed to ${newStatus}`,
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
    const success = await updateRegistrationStatus(pendingApproveId, "approved", "group", orNumber)
    if (success) {
      setRegistrations((prev) => prev.map((reg) => (reg.id === pendingApproveId ? { ...reg, status: "approved", or_number: orNumber } : reg)))
      toast({ title: "Status updated", description: "Group registration approved" })
    } else {
      toast({ title: "Update failed", description: "Failed to update registration status", variant: "destructive" })
    }
    setUpdating(null)
    setPendingApproveId(null)
    setOrNumber("")
    setOrDialogOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this group registration and all its participants?")) return

    try {
      const success = await deleteRegistration(id, "group")

      if (success) {
        setRegistrations((prev) => prev.filter((reg) => reg.id !== id))
        toast({
          title: "Group registration deleted",
          description: "The group registration and all participants have been removed",
        })
      } else {
        toast({
          title: "Delete failed",
          description: "Failed to delete group registration",
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

  const handleViewFile = (fileUrl: string | null, fileName: string) => {
    if (fileUrl) {
      window.open(fileUrl, "_blank")
    } else {
      toast({
        title: `No ${fileName} available`,
        description: `This registration doesn't have a ${fileName} uploaded.`,
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (field: "excelFile" | "receiptFile", file: File | null) => {
    if (!file) return

    if (field === "excelFile") {
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an Excel file (.xlsx or .xls).",
          variant: "destructive",
        })
        return
      }
    }

    if (field === "receiptFile") {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, JPEG, or PNG file.",
          variant: "destructive",
        })
        return
      }
    }

    setFormData((prev) => ({ ...prev, [field]: file }))
  }

  // Export CSV
  const handleExport = (targetRegistration?: GroupRegistrationWithOffice) => {
  let exportRows: Record<string, string | number>[] = [];
  if (targetRegistration) {
    // Export participants for a single registration (from dialog)
    if (!targetRegistration.group_participants?.length) {
      toast({ title: "No data to export", description: "No participants to export for this group." });
      return;
    }
    exportRows = targetRegistration.group_participants.map((p, idx) => ({
      "#": idx + 1,
      "Organization Name": targetRegistration.agency_name,
      "Field Office": targetRegistration.field_offices?.name || "",
      "Group Status": targetRegistration.status,
      "Contact Number": targetRegistration.contact_number,
      "Participant Name": p.full_name,
      "Age": p.age,
      "Gender": p.gender,
      "OR Number": p.or_number ?? targetRegistration.or_number ?? "",
      "Registered Date": p.created_at ? new Date(p.created_at).toLocaleString() : "",
    }));
    downloadCSV(
      `${targetRegistration.agency_name.replace(/\s+/g, "_")}_participants_${Date.now()}.csv`,
      exportRows
    );
    return;
  }
  // Export all participants for all group registrations
  if (registrations.length === 0) {
    toast({ title: "No data to export", description: "There are no group registrations to export." });
    return;
  }
  registrations.forEach((reg) => {
    if (reg.group_participants?.length) {
      reg.group_participants.forEach((p, idx) => {
        exportRows.push({
          "#": exportRows.length + 1,
          "Organization Name": reg.agency_name,
          "Field Office": reg.field_offices?.name || "",
          "Group Status": reg.status,
          "Contact Number": reg.contact_number,
          "Participant Name": p.full_name,
          "Age": p.age,
          "Gender": p.gender,
          "OR Number": p.or_number ?? reg.or_number ?? "",
          "Registered Date": p.created_at ? new Date(p.created_at).toLocaleString() : "",
        });
      });
    }
  });
  if (exportRows.length === 0) {
    toast({ title: "No participants to export", description: "No group participants found." });
    return;
  }
  downloadCSV(`group_participants_${Date.now()}.csv`, exportRows);
};

  const handleSubmitNewRegistration = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.templateData || !formData.receiptFile) {
      toast({
        title: "Missing information",
        description: "Please upload the Excel template and payment receipt.",
        variant: "destructive",
      })
      return
    }

    if (
      !formData.templateData.organizationName ||
      !formData.templateData.contactNumber ||
      !formData.templateData.participants.length
    ) {
      toast({
        title: "Incomplete template data",
        description: "Please ensure the Excel template has organization details and participants.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Use the field office ID directly instead of trying to convert to code
      const result = await submitGroupRegistration({
        agencyName: formData.templateData.organizationName,
        contactNumber: formData.templateData.contactNumber,
        fieldOfficeCode: fieldOfficeId.toString(), // Pass the field office ID as string
        receiptFile: formData.receiptFile,
        participants: formData.templateData.participants.map((p) => ({
          fullName: p.fullName,
          age: p.age,
          gender: p.gender,
          email: p.email,
        })),
      })

      if (result.success) {
        toast({
          title: "Group registration submitted!",
          description: `Successfully submitted registration for ${formData.templateData.organizationName} with ${formData.templateData.participants.length} participants.`,
        })

        // Reset form
        setFormData({
          agencyName: "",
          contactNumber: "",
          excelFile: null,
          receiptFile: null,
          templateData: null,
        })
        setShowNewRegistrationForm(false)
        loadRegistrations()
      } else {
        throw new Error(result.error || "Submission failed")
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleTemplateProcessed = (data: GroupRegistrationTemplate) => {
    setFormData((prev) => ({
      ...prev,
      agencyName: data.organizationName,
      contactNumber: data.contactNumber,
      templateData: data,
    }))
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

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
    totalParticipants: registrations.reduce((sum, reg) => sum + (reg.participant_count || 0), 0),
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span>Loading group registrations...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fieldOffices = [
    { id: 1, name: "Region 1" },
    { id: 2, name: "Region 2" },
  ]

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Groups</p>
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
                <p className="text-sm font-medium text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalParticipants}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-purple-600" />
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
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Group Registrations ({registrations.length})
              </CardTitle>
              <CardDescription>Manage group registrations with Excel participant lists</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNewRegistrationForm(!showNewRegistrationForm)} size="sm">
                <Upload className="h-4 w-4 mr-2" />
                New Registration
              </Button>
              <Button variant="outline" onClick={loadRegistrations} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport()}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* New Registration Form */}
          {showNewRegistrationForm && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">New Group Registration</CardTitle>
                <CardDescription>Submit a new group registration with participant list</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Excel Template Manager */}
                <ExcelTemplateManager
                  fieldOfficeName={fieldOffices.find((fo) => fo.id === fieldOfficeId)?.name || "Unknown Office"}
                  onTemplateProcessed={handleTemplateProcessed}
                />

                {/* Registration Form - only show if template is processed */}
                {formData.templateData && (
                  <Card className="mt-6 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Complete Registration</CardTitle>
                      <CardDescription>Upload payment receipt to complete the registration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitNewRegistration} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input value={formData.agencyName} disabled className="bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label>Contact Number</Label>
                            <Input value={formData.contactNumber} disabled className="bg-white" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Participants</Label>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-sm font-medium">
                              {formData.templateData.participants.length} participants loaded from Excel template
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formData.templateData.participants.filter((p) => p.gender === "Male").length} Male,{" "}
                              {formData.templateData.participants.filter((p) => p.gender === "Female").length} Female
                            </p>
                          </div>
                        </div>

                        {/* Receipt Upload */}
                        <div className="space-y-2">
                          <Label>Official Receipt *</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange("receiptFile", e.target.files?.[0] || null)}
                              className="hidden"
                              id="receipt-upload-new"
                            />
                            <label htmlFor="receipt-upload-new" className="cursor-pointer">
                              <Receipt className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600">
                                {formData.receiptFile ? formData.receiptFile.name : "Click to upload receipt"}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG (Max 5MB)</p>
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={submitting || !formData.receiptFile || !formData.templateData}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {submitting ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Group Registration"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowNewRegistrationForm(false)
                              setFormData({
                                agencyName: "",
                                contactNumber: "",
                                excelFile: null,
                                receiptFile: null,
                                templateData: null,
                              })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {/* Registrations List */}
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No group registrations yet.</div>
            ) : (
              registrations.map((registration) => (
                <Card key={registration.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{registration.agency_name}</h3>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {registration.participant_count || 0} participants
                          </Badge>
                          {getStatusBadge(registration.status)}
                          {isMainAdmin && registration.field_offices && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {registration.field_offices.name}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Contact:</span> {registration.contact_number}
                          </p>
                          <p>
                            <span className="font-medium">OR #:</span> {registration.or_number ?? "—"}
                          </p>
                          <p>
                            <span className="font-medium">Submitted:</span>{" "}
                            {new Date(registration.submitted_at).toLocaleString()}
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
                            onClick={() => {
                              setSelectedRegistration(registration)
                              setParticipantsDialogOpen(true)
                            }}
                            disabled={!registration.group_participants?.length}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewFile(registration.excel_file_url ?? null, "Excel file")}
                            disabled={!registration.excel_file_url}
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewFile(registration.receipt_url ?? null, "receipt")}
                            disabled={!registration.receipt_url}
                          >
                            <Receipt className="h-4 w-4" />
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
            <DialogTitle>Group Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Agency Name</label>
                  <p className="font-medium">{selectedRegistration.agency_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <p>{selectedRegistration.contact_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Participants</label>
                  <p>{selectedRegistration.participant_count || 0} people</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">OR Number</label>
                  <p>{selectedRegistration.or_number ?? "—"}</p>
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
              </div>

              <div className="flex gap-2 pt-4">
                {selectedRegistration.excel_file_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewFile(selectedRegistration.excel_file_url ?? null, "Excel file")}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    View Excel File
                  </Button>
                )}
                {selectedRegistration.receipt_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewFile(selectedRegistration.receipt_url ?? null, "receipt")}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>
                )}
                {selectedRegistration.group_participants?.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setParticipantsDialogOpen(true)
                      setViewDialogOpen(false)
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Participants
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Participants Dialog */}
      <Dialog open={participantsDialogOpen} onOpenChange={setParticipantsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Participants - {selectedRegistration?.agency_name}</DialogTitle>
          </DialogHeader>
          {selectedRegistration?.group_participants && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Total participants: {selectedRegistration.group_participants.length}
                </p>
                <Button variant="outline" size="sm" onClick={() => handleExport(selectedRegistration!)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <div className="grid grid-cols-5 gap-2 font-medium text-sm">
                    <span>Name</span>
                    <span>Age</span>
                    <span>Gender</span>
                    <span>OR #</span>
                    <span>Email</span>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {selectedRegistration.group_participants.map((participant, index) => (
                    <div key={participant.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        <span className="font-medium">{participant.full_name}</span>
                        <span>{participant.age}</span>
                        <span className="w-16">
                          <Badge
                            variant="default"
                            className={`text-xs w-full justify-center ${participant.gender === 'Female' ? 'bg-pink-500 text-white' : ''}`}
                          >
                            {participant.gender}
                          </Badge>
                        </span>
                        <span>{participant.or_number ?? "—"}</span>
                        <span>{participant.email_address ?? "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
