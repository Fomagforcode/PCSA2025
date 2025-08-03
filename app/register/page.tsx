"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, CheckCircle, User, Phone, MapPin, Building2, Receipt, Download, Mail } from "lucide-react"
import Link from "next/link"
import { submitIndividualRegistration } from "@/lib/registrations"

const fieldOffices = [
  { code: "cotabato", name: "FO - Cotabato City" },
  { code: "sulu_station", name: "FO - Sulu/Basilan (Sulu Station)" },
  { code: "basilan_station", name: "FO - Sulu/Basilan (Basilan Station)" },
  { code: "lanao", name: "FO - Lanao Del Sur" },
  { code: "tawi", name: "FO - Tawi-Tawi" },
  { code: "maguindanao", name: "FO - Maguindanao" },
]

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleInitial: "",
    lastName: "",
    emailAddress: "",
    fullName: "", // auto-generated
    age: "",
    gender: "",
    contactNumber: "",
    address: "",
    fieldOffice: "",
    receipt: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"]
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, JPEG, or PNG file.",
          variant: "destructive",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      setFormData((prev) => ({ ...prev, receipt: file }))
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded.`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !(formData.firstName && formData.lastName) ||
      !formData.age ||
      !formData.gender ||
      !formData.emailAddress ||
      !formData.contactNumber ||
      !formData.address ||
      !formData.fieldOffice ||
      !formData.receipt
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload your receipt.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await submitIndividualRegistration({
        fullName: formData.fullName || `${formData.firstName} ${(formData.middleInitial || "").trim()} ${formData.lastName}`.replace(/\s+/g, " ").trim(),
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        contactNumber: formData.contactNumber,
        emailAddress: formData.emailAddress,
         address: formData.address,
        fieldOfficeCode: formData.fieldOffice,
        receiptFile: formData.receipt,
      })

      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: "Registration successful!",
          description: "Your registration has been submitted successfully.",
        })
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    const selectedOffice = fieldOffices.find((office) => office.code === formData.fieldOffice)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-600 mb-2">Registration Successful!</CardTitle>
            <CardDescription className="text-lg">
              Your registration for Funrun 2025 has been submitted to {selectedOffice?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Your registration for Funrun 2025 has been saved to the database</li>
                <li>• Field Office staff will review your submission</li>
                <li>• Keep your receipt for verification purposes</li>
                <li>• Contact your Field Office for any questions about the 2025 event</li>
              </ul>
            </div>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-3 rounded-lg shadow-lg">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8 animate-fade-in">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4 hover:bg-white/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Individual Registration</h1>
              <p className="text-gray-600">Fill in your details to register for Funrun 2025</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
              <CardTitle className="text-xl">Registration Form</CardTitle>
              <CardDescription className="text-blue-100">
                Please provide accurate information and upload your payment receipt
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Name *</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        id="firstName" pattern="[A-Za-z]+"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            firstName: (() => {
                                const clean = e.target.value.replace(/[^A-Za-z]/g, "");
                                return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
                              })(),
                            fullName: `${e.target.value} ${(prev.middleInitial || "").trim()} ${prev.lastName}`.replace(/\s+/g, " ").trim(),
                          }))
                        }
                        placeholder="First Name"
                        className="h-11"
                        required
                      />
                      <Input
                        id="middleInitial" pattern="[A-Za-z]?"
                        value={formData.middleInitial}
                        maxLength={2}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            middleInitial: e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase(),
                            fullName: `${prev.firstName} ${e.target.value.toUpperCase()} ${prev.lastName}`.replace(/\s+/g, " ").trim(),
                          }))
                        }
                        placeholder="MI (optional)"
                        className="h-11"
                      />
                      <Input
                        id="lastName" pattern="[A-Za-z]+"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lastName: (() => {
                              const clean = e.target.value.replace(/[^A-Za-z]/g, "");
                              return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
                            })(),
                            fullName: `${prev.firstName} ${(prev.middleInitial || "").trim()} ${e.target.value}`.replace(/\s+/g, " ").trim(),
                          }))
                        }
                        placeholder="Last Name"
                        className="h-11"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                        Age *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.age}
                        onChange={(e) => handleInputChange("age", e.target.value)}
                        placeholder="Your age"
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                        Gender *
                      </Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactNumber"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Contact Number *
                    </Label>
                    <Input
                      id="contactNumber"
                      type="tel"
                      pattern="[0-9]{11}"
                      maxLength={11}
                      value={formData.contactNumber.replace(/[^0-9]/g, "")}
                      onChange={(e) => handleInputChange("contactNumber", e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="Enter your mobile number"
                      className="h-11"
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <Label htmlFor="emailAddress" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="emailAddress"
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                      placeholder="Enter your email address"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Complete Address *
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your complete address including barangay, city/municipality, and province"
                      rows={3}
                      className="resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Payment Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldOffice" className="text-sm font-medium text-gray-700">
                      Payment Center *
                    </Label>
                    <Select
                      value={formData.fieldOffice}
                      onValueChange={(value) => handleInputChange("fieldOffice", value)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select the Field Office where you made your payment" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOffices.map((office) => (
                          <SelectItem key={office.code} value={office.code}>
                            {office.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receipt" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Official Receipt / Voucher *
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        formData.receipt
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 hover:border-gray-400 bg-gray-50"
                      }`}
                    >
                      <input
                        id="receipt"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <label htmlFor="receipt" className="cursor-pointer">
                        {formData.receipt ? (
                          <div className="space-y-2">
                            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                            <p className="text-sm font-medium text-green-700">{formData.receipt.name}</p>
                            <p className="text-xs text-green-600">File uploaded successfully</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="text-sm font-medium text-gray-600">Click to upload your receipt</p>
                            <p className="text-xs text-gray-400">PDF, JPEG, PNG (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-4 border rounded-md p-4 bg-gray-50 mt-6">
                  <h4 className="text-center font-semibold text-gray-800">Terms and Conditions</h4>
                  <div className="h-40 overflow-y-auto prose text-sm text-gray-700 bg-white p-4 rounded-md border">
                    <p className="mb-4">I, hereby attest that I am physically and mentally fit to participate in the 2025 PCSA Fun Run of the Civil Service Commission for BARMM. I understand and acknowledge the inherent risks associated with physical activities of this nature.</p>
                    <p className="mb-4">I give my consent for any broadcast, print, or digital media coverage of this event to use my name, photographs, and/or voice without compensation or additional approval.</p>
                    <p className="mb-4">In consideration of my participation, I, for myself, my heirs, executors, and administrators, hereby waive, release, and discharge any and all rights to claims or damages against the event organizers, sponsors, volunteers, and all parties involved in this event.</p>
                    <p className="mb-4">I acknowledge that I have carefully read, understood, and agreed to the terms of this waiver. I also commit to abide by all guidelines, rules, and instructions issued by the activity officials before, during, and after the event.</p>
                    <p className="mb-4">I hereby give my consent to the Civil Service Commission for BARMM to collect and process my/our personal information including, but not limited to name, age, sex, address, contact number, and email address, for purposes related in this event.</p>
                  </div>
                  <label className="flex items-start gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <span>I have read and agree to the waiver terms above.</span>
                  </label>
                  <label className="flex items-start gap-2 text-sm text-gray-800 mt-2">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    />
                    <span>I have read and agree to the data privacy consent above.</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold text-lg rounded-lg shadow-lg"
                  disabled={isSubmitting || !acceptedTerms || !acceptedPrivacy}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting Registration...
                    </div>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
