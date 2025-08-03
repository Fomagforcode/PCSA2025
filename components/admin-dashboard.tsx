"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Users, UserPlus, LogOut, Clock, Shield, Building2, BarChart3, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { GroupRegistration } from "@/components/group-registration"
import { IndividualRegistrations } from "@/components/individual-registrations"
import { MainAdminView } from "@/components/main-admin-view"
import { NotificationCenter } from "@/components/notification-center"
import { LiveStats } from "@/components/live-stats"
import { ParticipantMasterList } from "@/components/participant-master-list"
import { clearAuth, isMainAdmin, type AdminUser } from "@/lib/auth"

interface AdminDashboardProps {
  authData: AdminUser
}

const fieldOfficeColors = {
  cotabato: "from-blue-500 to-blue-600",
  sulu: "from-green-500 to-green-600",
  lanao: "from-purple-500 to-purple-600",
  tawi: "from-orange-500 to-orange-600",
  maguindanao: "from-red-500 to-red-600",
}

export function AdminDashboard({ authData }: AdminDashboardProps) {
  const [tabsVisible, setTabsVisible] = useState(true)
  const [admin] = useState<AdminUser>(authData)
  const [activeTab, setActiveTab] = useState("overview")
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

  const officeColor =
    fieldOfficeColors[admin.fieldOffice as keyof typeof fieldOfficeColors] || "from-gray-500 to-gray-600"
  const loginTime = new Date().toLocaleString()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${officeColor} rounded-lg flex items-center justify-center shadow-lg`}
              >
                {isMainAdmin(admin) ? (
                  <Shield className="h-6 w-6 text-white" />
                ) : (
                  <Building2 className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isMainAdmin(admin) ? "Main Admin Dashboard" : "Field Office Dashboard"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-gray-600">FO - {admin.fieldOfficeName}</p>
                  {isMainAdmin(admin) && (
                    <Badge variant="default" className="bg-gradient-to-r from-red-500 to-red-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Main Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Logged in: {loginTime}
                </p>
              </div>
              <NotificationCenter fieldOffice={String(admin.fieldOfficeId)} />
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`bg-gradient-to-r ${officeColor} text-white font-semibold`}>
                  {admin.name.charAt(0).toUpperCase()}
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
        {isMainAdmin(admin) ? (
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {tabsVisible && (
                <TabsList className="grid w-full grid-cols-3 h-12 bg-white shadow-sm">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="individual"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  Individual Registrations
                </TabsTrigger>
                <TabsTrigger
                  value="group"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  <UserPlus className="h-4 w-4" />
                  Group Registration
                </TabsTrigger>
              </TabsList>
              )}
              {isMainAdmin(admin) && (
              <div className="flex justify-end mt-2">
                <Button variant="ghost" size="icon" onClick={() => setTabsVisible(!tabsVisible)}>
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </div>
              )}

              <TabsContent value="overview" className="animate-fade-in">
                {isMainAdmin(admin) ? (
                  <MainAdminView />
                ) : (
                  <div className="space-y-6">
                      <LiveStats fieldOfficeId={admin.fieldOfficeId} />
                      <ParticipantMasterList fieldOfficeId={admin.fieldOfficeId} />
                    </div>
                )}
              </TabsContent>

              <TabsContent value="individual" className="animate-fade-in">
                <IndividualRegistrations fieldOfficeId={admin.fieldOfficeId} />
              </TabsContent>

              <TabsContent value="group" className="animate-fade-in">
                <GroupRegistration fieldOfficeId={admin.fieldOfficeId} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {tabsVisible && (
                <TabsList className="grid w-full grid-cols-3 h-12 bg-white shadow-sm">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="individual"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  Individual Registrations
                </TabsTrigger>
                <TabsTrigger
                  value="group"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                >
                  <UserPlus className="h-4 w-4" />
                  Group Registration
                </TabsTrigger>
              </TabsList>
              )}
              {isMainAdmin(admin) && (
              <div className="flex justify-end mt-2">
                <Button variant="ghost" size="icon" onClick={() => setTabsVisible(!tabsVisible)}>
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </div>
              )}

              <TabsContent value="overview" className="animate-fade-in">
                <div className="space-y-6">
                      <LiveStats fieldOfficeId={admin.fieldOfficeId} />
                      <ParticipantMasterList fieldOfficeId={admin.fieldOfficeId} />
                    </div>
              </TabsContent>

              <TabsContent value="individual" className="animate-fade-in">
                <IndividualRegistrations fieldOfficeId={admin.fieldOfficeId} />
              </TabsContent>

              <TabsContent value="group" className="animate-fade-in">
                <GroupRegistration fieldOfficeId={admin.fieldOfficeId} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
