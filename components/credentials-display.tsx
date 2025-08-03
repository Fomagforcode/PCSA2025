"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff, Shield, User, Key } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Credential {
  office: string
  username: string
  password: string
  role: string
  description: string
  color: string
}

const credentials: Credential[] = [
  {
    office: "Cotabato City",
    username: "admin_cotabato",
    password: "Cotabato2025!",
    role: "Field Office Admin",
    description: "Manage registrations for Cotabato City Field Office",
    color: "from-blue-500 to-blue-600",
  },
  {
    office: "Sulu Station",
    username: "admin_sulu_station",
    password: "Sulu2025!",
    role: "Field Office Admin",
    description: "Manage registrations for Sulu Station Field Office",
    color: "from-green-500 to-green-600",
  },
  {
    office: "Basilan Station",
    username: "admin_basilan_station",
    password: "Basilan2025!",
    role: "Field Office Admin",
    description: "Manage registrations for Basilan Station Field Office",
    color: "from-teal-500 to-teal-600",
  },
  {
    office: "Lanao Del Sur",
    username: "admin_lanao",
    password: "Lanao2025!",
    role: "Field Office Admin",
    description: "Manage registrations for Lanao Del Sur Field Office",
    color: "from-purple-500 to-purple-600",
  },
  {
    office: "Tawi-Tawi",
    username: "admin_tawi",
    password: "Tawi2025!",
    role: "Field Office Admin",
    description: "Manage registrations for Tawi-Tawi Field Office",
    color: "from-orange-500 to-orange-600",
  },
  {
    office: "Maguindanao (Main Admin)",
    username: "main_admin",
    password: "MainAdmin2025!",
    role: "Main Administrator",
    description: "Full access to all Field Offices and centralized management",
    color: "from-red-500 to-red-600",
  },
  {
    office: "RD/ARD Monitoring",
    username: "rd_ard",
    password: "RDARD2025!",
    role: "RD/ARD Monitor",
    description: "Read-only monitoring across all Field Offices",
    color: "from-cyan-500 to-cyan-600",
  }
]

export function CredentialsDisplay() {
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const { toast } = useToast()

  const togglePasswordVisibility = (username: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [username]: !prev[username],
    }))
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Credentials</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Use these credentials to access the respective Field Office dashboards. Each admin has access only to their
          Field Office data, except the Main Admin who has full system access.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {credentials.map((cred) => (
          <Card key={cred.username} className="border-0 shadow-lg card-hover">
            <CardHeader className="pb-4">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${cred.color} rounded-lg flex items-center justify-center mb-3`}
              >
                {cred.role === "Main Administrator" ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              <CardTitle className="text-lg">{cred.office}</CardTitle>
              <CardDescription className="text-sm">{cred.description}</CardDescription>
              <Badge variant={cred.role === "Main Administrator" ? "default" : "secondary"} className="w-fit">
                {cred.role}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-md text-sm font-mono">{cred.username}</code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(cred.username, "Username")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded-md text-sm font-mono">
                    {showPasswords[cred.username] ? cred.password : "••••••••••••"}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => togglePasswordVisibility(cred.username)}>
                    {showPasswords[cred.username] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(cred.password, "Password")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Security Notice</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• These are demo credentials for testing purposes</li>
                <li>• In production, use strong, unique passwords</li>
                <li>• Enable two-factor authentication when available</li>
                <li>• Regularly update passwords and review access logs</li>
                <li>• Never share credentials or store them in plain text</li>
                <li>• Valid for Funrun 2025 registration system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
