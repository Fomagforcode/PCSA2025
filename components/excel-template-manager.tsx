"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users } from "lucide-react"
import { downloadExcelTemplate, parseExcelTemplate, type GroupRegistrationTemplate } from "@/lib/excel-template"

interface ExcelTemplateManagerProps {
  fieldOfficeName: string
  onTemplateProcessed: (data: GroupRegistrationTemplate) => void
}

export function ExcelTemplateManager({ fieldOfficeName, onTemplateProcessed }: ExcelTemplateManagerProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [templateData, setTemplateData] = useState<GroupRegistrationTemplate | null>(null)
  const { toast } = useToast()

  const handleDownloadTemplate = async () => {
    try {
      const ok = await downloadExcelTemplate(fieldOfficeName)
      if (!ok) throw new Error("Download returned false")

      toast({
        title: "Template Downloaded",
        description: "Excel template has been downloaded from Google Sheets.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate Excel template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ]

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Excel file must be less than 10MB",
        variant: "destructive",
      })
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)

    try {
      const data = await parseExcelTemplate(file)
      setTemplateData(data)
      onTemplateProcessed(data)

      toast({
        title: "Template Processed Successfully",
        description: `Loaded ${data.participants.length} participants from ${data.organizationName}`,
      })
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process Excel template",
        variant: "destructive",
      })
      setUploadedFile(null)
      setTemplateData(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetTemplate = () => {
    setUploadedFile(null)
    setTemplateData(null)
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Download Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Step 1: Download Excel Template
          </CardTitle>
          <CardDescription>
            Download the Excel template, fill in organization details and participant information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadTemplate} className="w-full bg-transparent" variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Upload Completed Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-600" />
            Step 2: Upload Completed Template
          </CardTitle>
          <CardDescription>
            Upload the completed Excel template with organization and participant details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-upload"
              disabled={isProcessing}
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-600 mb-2">
                {uploadedFile ? uploadedFile.name : "Click to upload completed Excel template"}
              </p>
              <p className="text-xs text-gray-400">Supports .xlsx and .xls files (Max 10MB)</p>
            </label>
          </div>

          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold text-blue-900">Processing Excel Template...</span>
              </div>
              <p className="text-sm text-blue-800 mt-1">Reading organization details and participant information</p>
            </div>
          )}

          {templateData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">Template Processed Successfully</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 text-sm">
                <div>
                  <span className="font-medium text-green-800">Organization:</span>
                  <p className="text-green-700">{templateData.organizationName}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800">Contact:</span>
                  <p className="text-green-700">{templateData.contactNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800">Contact Person:</span>
                  <p className="text-green-700">{templateData.contactPerson || "Not specified"}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800">Email:</span>
                  <p className="text-green-700">{templateData.contactEmail || "Not specified"}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">{templateData.participants.length} Participants</span>
                  </div>
                  <div className="text-sm text-green-700">
                    Male: {templateData.participants.filter((p) => p.gender === "Male").length} | Female:{" "}
                    {templateData.participants.filter((p) => p.gender === "Female").length}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={resetTemplate}>
                  Upload Different File
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="h-5 w-5" />
            Important Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Download the template and fill in all required organization information</li>
            <li>Add participant details in the "Participants" sheet with Full Name, Age, and Gender</li>
            <li>Gender should be "Male" or "Female" (or "M"/"F")</li>
            <li>Remove or clear the example participant rows (John Doe, Jane Smith)</li>
            <li>Save the file and upload it back to continue with registration</li>
            <li>After successful upload, you'll need to upload the payment receipt</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
